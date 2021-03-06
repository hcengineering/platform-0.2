//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
import { MessageNode, serializeMessage } from '@anticrm/text'
import { CoreService } from '@anticrm/platform-core'
import chunter, { ChunterService } from '.'

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
export default async (platform: Platform, deps: { core: CoreService }): Promise<ChunterService> => { // eslint-disable-line @typescript-eslint/no-unused-vars
  platform.setResource(chunter.component.ActivityView, ActivityView)
  platform.setResource(chunter.component.ChatView, ChatView)
  platform.setResource(chunter.component.MessageInfo, MessageInfo)
  platform.setResource(chunter.component.SpaceInfo, SpaceInfo)
  platform.setResource(chunter.component.PageProperties, PageProperties)
  platform.setResource(chunter.component.PageInfo, PageInfo)

  function createMissedObjects (doc: MessageNode): string {
    return serializeMessage(doc)
  }

  const service = {
    createMissedObjects
  }

  return service
}
