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

import { Platform } from '@anticrm/platform'
import { Ref, parseMessage, MessageElement, MessageElementKind, MessageText, MessageLink } from '@anticrm/core'
import { CoreService } from '@anticrm/platform-core'
import chunter, { ChunterService, Page } from '.'

import ActivityView from './components/internal/ActivityView.svelte'
import ChatView from './components/internal/ChatView.svelte'
import PageProperties from './components/internal/PageProperties.svelte'
import PageInfo from './components/internal/PageInfo.svelte'

/*!
 * Anticrm Platform™ Chunter Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService }): Promise<ChunterService> => {

  platform.setResource(chunter.component.ActivityView, ActivityView)
  platform.setResource(chunter.component.ChatView, ChatView)
  platform.setResource(chunter.component.PageProperties, PageProperties)
  platform.setResource(chunter.component.PageInfo, PageInfo)

  const coreService = deps.core

  function parseXMLMessage (message: string): MessageElement[] {
    console.log('parseXML:', message)
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
        const attrs = (node as Element).attributes
        const _class = attrs.getNamedItem('class')?.nodeValue
        const _id = attrs.getNamedItem('id')?.nodeValue
        const text = node.childNodes[0].nodeValue
        result.push({
          kind: MessageElementKind.LINK,
          text,
          _id,
          _class
        } as MessageLink)
      }
    }
    return result
  }

  function toMessage (parsed: MessageElement[]): string {
    let result = ''
    for (const element of parsed) {
      if (element.kind === MessageElementKind.LINK) {
        const link = element as MessageLink
        // result += `<reference id="${link._id}" class="${link._class}">${link.text}</reference>`
        result += `[[${link.text}|${link._class}|${link._id}]]`
      } else {
        result += element.text
      }
    }
    // result += '</p>'
    console.log('toMessage:', result)
    return result
  }

  function createMissedObjects (message: string): string {
    console.log('createMissedObjects', message)
    const referenced = []
    const elements = parseXMLMessage(message)
    for (const element of elements) {
      if (element.kind === MessageElementKind.LINK) {
        const link = element as MessageLink
        const title = link.text.substring(2, link.text.length - 2)
        link.text = title
        if (link._id == undefined) {
          const id = coreService.generateId() as Ref<Page>
          // coreService.createVDoc(chunter.class.Page, {
          //   title,
          //   comments: []
          // }, id)
          link._id = id
          link._class = chunter.class.Page
        }
        referenced.push(link)
      } else {
        referenced.push(element)
      }
    }
    return toMessage(referenced)
  }

  const service = {
    parseMessage,
    createMissedObjects
  }

  return service

}
