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
import { MessageNode, serializeMessage } from '@anticrm/core'
import { CoreService } from '@anticrm/platform-core'
import chunter, { ChunterService, Page } from '.'

import ActivityView from './components/internal/ActivityView.svelte'
import ChatView from './components/internal/ChatView.svelte'
import MessageInfo from './components/internal/MessageInfo.svelte'
import SpaceInfo from './components/internal/SpaceInfo.svelte'
import PageProperties from './components/internal/PageProperties.svelte'
import PageInfo from './components/internal/PageInfo.svelte'

/*!
 * Anticrm Platform™ Chunter Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (
  platform: Platform,
  deps: { core: CoreService }
): Promise<ChunterService> => {
  platform.setResource(chunter.component.ActivityView, ActivityView)
  platform.setResource(chunter.component.ChatView, ChatView)
  platform.setResource(chunter.component.MessageInfo, MessageInfo)
  platform.setResource(chunter.component.SpaceInfo, SpaceInfo)
  platform.setResource(chunter.component.PageProperties, PageProperties)
  platform.setResource(chunter.component.PageInfo, PageInfo)

  const coreService = deps.core

  function createMissedObjects(doc: MessageNode): string {
    // for (const element of elements) {
    //   if (element.kind === MessageElementKind.LINK) {
    //     const link = element as MessageLink
    //     const title = link.text.substring(2, link.text.length - 2)
    //     link.text = title
    //     if (link._id == undefined) {
    //       const id = coreService.generateId() as Ref<Page>
    //       // coreService.createVDoc(chunter.class.Page, {
    //       //   title,
    //       //   comments: []
    //       // }, id)
    //       link._id = id
    //       link._class = chunter.class.Page
    //     }
    //     referenced.push(link)
    //   } else {
    //     referenced.push(element)
    //   }
    // }
    return serializeMessage(doc)
  }

  const service = {
    createMissedObjects
  }

  return service
}
