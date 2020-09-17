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

export interface Backlink {
  _backlinkClass: Ref<Class<Doc>>
  _backlinkId: Ref<Doc>
}

export interface Backlinks extends Doc {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  backlinks: Backlink[]
}

export interface Text extends Type {
}

export const CORE_CLASS_BACKLINKS = 'class:core.Backlinks' as Ref<Class<Backlinks>>
export const CORE_CLASS_TEXT = 'class:core.Text' as Ref<Class<Text>>
export const BACKLINKS_DOMAIN = 'backlinks'

export enum MessageElementKind {
  TEXT = 0,
  LINK = 1
}

export interface MessageElement {
  kind: MessageElementKind
  text: string
}

export interface MessageText extends MessageElement {
}

export interface MessageLink extends MessageElement {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
}

// I N D E X

export class TextIndex implements Index {
  private modelDb: Model
  private storage: Storage
  private textAttributes = new Map<Ref<Class<Obj>>, string[]>()

  constructor (modelDb: Model, storage: Storage) {
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

  async tx (tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        return this.onCreate(tx as CreateTx)
      default:
        console.log('not implemented text tx', tx)
    }
  }

  async onCreate (create: CreateTx): Promise<any> {
    const attributes = this.getTextAttibutes(create.object._class)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.backlinks((create.object as any)[attr] as string))
    }
    if (backlinks.length === 0) { return }
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

// P A R S E R

enum State {
  STATE_TEXT,
  STATE_FIRST_BRACKET,
  STATE_TITLE,
  STATE_TITLE_FIRST_BRACKET
}

export function parseMessage (message: string): MessageElement[] {
  const result = []
  let pos = 0
  let state = State.STATE_TEXT
  let text = ''
  while (pos < message.length) {
    const c = message.charAt(pos)
    switch (state) {
      case State.STATE_TEXT:
        if (c === '[') {
          state = State.STATE_FIRST_BRACKET
        } else {
          text += c
        }
        break
      case State.STATE_FIRST_BRACKET:
        if (c === '[') {
          state = State.STATE_TITLE
          result.push({
            kind: MessageElementKind.TEXT,
            text
          } as MessageText)
          text = ''
        } else {
          state = State.STATE_TEXT
          text += '['
          text += c
        }
        break
      case State.STATE_TITLE:
        if (c === ']') {
          state = State.STATE_TITLE_FIRST_BRACKET
        } else {
          text += c
        }
        break
      case State.STATE_TITLE_FIRST_BRACKET:
        if (c === ']') {
          state = State.STATE_TEXT
          const parts = text.split('|')
          if (parts.length !== 3) {
            throw new Error('Title must be encoded as [[title|_class|_id]]')
          }
          result.push({
            kind: MessageElementKind.LINK,
            text: parts[0],
            _id: parts[2],
            _class: parts[1]
          } as MessageLink)
          text = ''
        } else {
          state = State.STATE_TITLE
          text += ']'
          text += c
        }
        break
    }
    ++pos
  }
  if (text.length > 0) {
    result.push({
      kind: MessageElementKind.TEXT,
      text
    } as MessageText)
  }
  return result
}
