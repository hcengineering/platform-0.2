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

import { MarkType } from 'prosemirror-model'

export const copyright = 'Copyright © 2020 Anticrm Platform Contributors.'

export interface EditorContentEvent {
  isEmpty: boolean
  bold: boolean
  italic: boolean
  cursor: { left: number, right: number, top: number, bottom: number }
  completionWord: string
  completionEnd: string
  selection: { from: number, to: number }
  inputHeight: number
}

// An actions interface, will be extended to allow operations.
export interface EditorActions {
  insertMark: (
    text: string,
    from: number,
    to: number,
    mark: MarkType,
    attrs?: { [key: string]: any }
  ) => void
  insert: (text: string, from: number, to: number) => void

  toggleBold: () => void
  toggleItalic: () => void
  toggleStrike: () => void
  toggleUnderline: () => void
  toggleUnOrderedList: () => void
  toggleOrderedList: () => void
  focus: () => void
}
