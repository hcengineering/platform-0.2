import { AnyLayout } from '@anticrm/core';
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

import {
  Ref,
  Class,
  Doc,
  Type,
  Obj,
  Index,
  Storage,
  Tx,
  CORE_CLASS_ARRAY,
  TxContext
} from './core'
import { CreateTx, CORE_CLASS_CREATETX } from './tx'
import { Model } from './model'
import { generateId } from './objectid'

import {
  MessageMarkType,
  MessageNode,
  parseMessage,
  ReferenceMark,
  traverseMarks,
  traverseMessage
} from './textmodel'

export interface Backlink {
  _backlinkClass: Ref<Class<Doc>>
  _backlinkId: Ref<Doc>
  pos: number
}

export interface Backlinks extends Doc {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  backlinks: Backlink[]
}

export interface Text extends Type { }

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
  private arrayAttributes = new Map<Ref<Class<Obj>>, string[]>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getTextAttributes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.textAttributes.get(_class)
    if (cached) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((attr) => attr[1].type._class === CORE_CLASS_TEXT)
      .map((attr) => attr[0])
    this.textAttributes.set(_class, keys)
    return keys
  }

  private getArrayAttributes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.arrayAttributes.get(_class)
    if (cached) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((attr) => attr[1].type._class === CORE_CLASS_ARRAY)
      .map((attr) => attr[0])
    this.arrayAttributes.set(_class, keys)
    return keys
  }

  private backlinksFromMessage (message: string, pos: number): Backlink[] {
    const result: Backlink[] = []
    traverseMessage(parseMessage(message) as MessageNode, (el) => {
      traverseMarks(el, (m) => {
        if (m.type === MessageMarkType.reference) {
          const rm = m as ReferenceMark
          result.push({
            _backlinkId: rm.attrs.id as Ref<Doc>,
            _backlinkClass: rm.attrs.class as Ref<Class<Doc>>,
            pos
          })
        }
      })
    })
    return result
  }

  private backlinks (
    _class: Ref<Class<Obj>>,
    obj: AnyLayout,
    pos: number
  ): Backlink[] {
    const attributes = this.getTextAttributes(_class)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.backlinksFromMessage((obj as any)[attr], pos))
    }
    return backlinks
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        return this.onCreate(ctx, tx as CreateTx)
      default:
        console.log('not implemented text tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    const backlinks = this.backlinks(create._objectClass, create.object, -1)
    const arrays = this.getArrayAttributes(create._objectClass)
    for (const attr of arrays) {
      const arr = (create.object as any)[attr]
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          backlinks.push(...this.backlinks(arr[i]._class, arr[i], i))
        }
      }
    }
    if (backlinks.length === 0) {
      return
    }
    const doc: Backlinks = {
      _class: CORE_CLASS_BACKLINKS,
      _id: generateId() as Ref<Backlinks>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      backlinks
    }
    return this.storage.store(ctx, doc)
  }
}
