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

import { Index } from '../utils'
import { MemDb } from '../memdb'
import { generateId } from '../objectid'
import { Doc, CreateTx, Ref, Class, Obj, Attribute } from '../core'
import {
  parseMessage, MessageElementKind, MessageLink,
  TEXT_TYPE_CLASS, BACKLINKS_CLASS, Backlink, Backlinks
} from '../text'

export class TextIndex implements Index {
  private modelDb: MemDb
  private textAttributes = new Map<Ref<Class<Obj>>, string[]>()

  constructor(modelDb: MemDb) {
    this.modelDb = modelDb
  }

  private getTextAttibutes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.textAttributes.get(_class)
    if (cached) return cached

    const attributes = []
    const clazz = this.modelDb.get(_class) as Class<Doc>
    for (const key in clazz._attributes) {
      const attr = (clazz._attributes as { [key: string]: Attribute })[key]
      if (attr.type._class === TEXT_TYPE_CLASS) {
        attributes.push(key)
      }
    }

    if (clazz._extends)
      attributes.push(...this.getTextAttibutes(clazz._extends))

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

  onCreate (create: CreateTx): Doc | null {
    const attributes = this.getTextAttibutes(create._objectClass)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.backlinks(create._attributes[attr] as string))
    }
    if (backlinks.length === 0)
      return null
    return {
      _class: BACKLINKS_CLASS,
      _id: generateId() as Ref<Backlinks>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      backlinks
    } as Backlinks
  }
}
