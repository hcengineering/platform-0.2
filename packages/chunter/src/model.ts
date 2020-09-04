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

import { CoreService } from '@anticrm/platform-core'
import { CoreDomain, Doc } from '@anticrm/platform'

export enum MessageElementKind {
  TEXT,
  LINK
}

interface MessageElement {
  kind: MessageElementKind
}

export interface MessageText extends MessageElement {
  text: string
}

export interface MessageLink extends MessageElement {
  text: string
}

export function parseMessage (message: string): MessageElement[] {
  const result = []
  const parser = new DOMParser()
  const root = parser.parseFromString(message, 'text/xml')
  const children = root.childNodes[0].childNodes
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    console.log(node)
    if (node.nodeType === Node.TEXT_NODE) {
      result.push({
        kind: MessageElementKind.TEXT,
        text: node.nodeValue
      } as MessageText)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.childNodes[0].nodeValue
      result.push({
        kind: MessageElementKind.LINK,
        text
      } as MessageLink)
    }
  }
  return result
}
