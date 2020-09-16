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

import { Ref, Class, Doc, Type } from './core'

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
