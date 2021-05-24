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

import { Readable } from 'svelte/store'

import { Ref } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Plugin, plugin, Service } from '@anticrm/platform'
import { Asset, AnyComponent, getPlatform } from '@anticrm/platform-ui'
import { WorkbenchApplication } from '@anticrm/workbench'

export interface Participant {
  id: string
  internalID: string
  peer: RTCPeerConnection
  media: MediaStream
  isMediaReady: boolean
}

export interface MeetingService extends Service {
  room: {
    participants: Readable<Participant[]>
    user: Readable<Participant>
    isJoined: Readable<boolean>
  }
  join: (room: string) => Promise<void>
  leave: () => Promise<void>
}

const meetingPlugin = plugin(
  'meeting' as Plugin<MeetingService>,
  {
    core: core.id
  },
  {
    icon: {
      Meeting: '' as Asset
    },
    component: {
      MeetingView: '' as AnyComponent
    },
    application: {
      Meeting: '' as Ref<WorkbenchApplication>
    }
  }
)

export default meetingPlugin

export const getMeetingService = async (): Promise<MeetingService> =>
  await getPlatform().getPlugin(meetingPlugin.id)
