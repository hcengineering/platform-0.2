//
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Index, Storage } from '../utils'
import { Model } from '../model'
import { generateId } from '../objectid'
import { Doc, Ref, Class, Obj, Attribute } from '../core'
import { CreateTx } from '../tx'
import {
  parseMessage, MessageElementKind, MessageLink,
  CORE_CLASS_TEXT, CORE_CLASS_BACKLINKS, Backlink, Backlinks
} from '../text'

export class TextIndex implements Index {
  private modelDb: Model
  private storage: Storage
  private textAttributes = new Map<Ref<Class<Obj>>, string[]>()

  constructor(modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getTextAttibutes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.textAttributes.get(_class)
    if (cached) return cached

    const attributes = []
    const clazz = this.modelDb.get(_class) as Class<Doc>
    for (const key in clazz._attributes) {
      const attr = (clazz._attributes as { [key: string]: Attribute })[key]
      if (attr.type._class === CORE_CLASS_TEXT) {
        attributes.push(key)
      }
    }

    if (clazz._extends) { attributes.push(...this.getTextAttibutes(clazz._extends)) }

    this.textAttributes.set(_class, attributes)
    return attributes
  }

  private backlinks (message: string): Backlink[] {
    return parseMessage(message)
      .filter(el => el.kind === MessageElementKind.LINK)
      .map(el => ({
        _backlinkId: (el as MessageLink)._id,
        _backlinkClass: (el as MessageLink)._class
      }))
  }

  async onCreate (create: CreateTx): Promise<any> {
    const attributes = this.getTextAttibutes(create._objectClass)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.backlinks(create._attributes[attr] as string))
    }
    if (backlinks.length === 0) { return }
    const doc: Backlinks = {
      _class: CORE_CLASS_BACKLINKS,
      _id: generateId() as Ref<Backlinks>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      backlinks
    }
    return this.storage.store(doc)
  }

  async onPush (): Promise<any> {
    // return this.storage.push(tx._objectClass, tx._objectId, tx._attribute, tx._attributes)
  }

  async onUpdate (): Promise<any> {
    // return this.storage.push(tx._objectClass, tx._objectId, tx._attribute, tx._attributes)
  }
}
