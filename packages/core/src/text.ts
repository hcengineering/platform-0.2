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

import { Ref, Class, Doc, Type, Obj, Attribute, Tx } from './core'
import { CreateTx, CORE_CLASS_CREATETX } from './tx'
import { Index, Storage } from './core'
import { Model } from './model'
import { generateId } from './objectid'

import { MessageDocument, ReferenceMark, parseMessageText } from './textmodel'

export interface Backlink {
  _backlinkClass: Ref<Class<Doc>>
  _backlinkId: Ref<Doc>
}

export interface Backlinks extends Doc {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  backlinks: Backlink[]
}

export interface Text extends Type {}

export const CORE_CLASS_BACKLINKS = 'class:core.Backlinks' as Ref<
  Class<Backlinks>
>
export const CORE_CLASS_TEXT = 'class:core.Text' as Ref<Class<Text>>
export const BACKLINKS_DOMAIN = 'backlinks'

// I N D E X

export class TextIndex implements Index {
  private modelDb: Model
  private storage: Storage
  private textAttributes = new Map<Ref<Class<Obj>>, string[]>()

  constructor(modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getTextAttibutes(_class: Ref<Class<Obj>>): string[] {
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

    if (clazz._extends) {
      attributes.push(...this.getTextAttibutes(clazz._extends))
    }

    this.textAttributes.set(_class, attributes)
    return attributes
  }

  private backlinks(message: string): Backlink[] {
    let result: Backlink[] = []
    parseMessageText(message).traverse((el) => {
      el.traverseMarks((m) => {
        if (m instanceof ReferenceMark) {
          let rm = m as ReferenceMark
          result.push({
            _backlinkId: rm.attrs.id as Ref<Doc>,
            _backlinkClass: rm.attrs.class as Ref<Class<Doc>>
          })
        }
      })
    })
    return result
  }

  async tx(tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        return this.onCreate(tx as CreateTx)
      default:
        console.log('not implemented text tx', tx)
    }
  }

  async onCreate(create: CreateTx): Promise<any> {
    const attributes = this.getTextAttibutes(create.object._class)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.backlinks((create.object as any)[attr] as string))
    }
    if (backlinks.length === 0) {
      return
    }
    const doc: Backlinks = {
      _class: CORE_CLASS_BACKLINKS,
      _id: generateId() as Ref<Backlinks>,
      _objectClass: create.object._class,
      _objectId: create.object._id,
      backlinks
    }
    return this.storage.store(doc)
  }
}
