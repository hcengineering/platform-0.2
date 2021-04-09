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

import { plugin, Plugin, Service } from '@anticrm/platform'
import { AnyComponent, Asset, getPlatform } from '@anticrm/platform-ui'
import { Mixin, Ref } from '@anticrm/core'
import { Application, VDoc } from '@anticrm/domains'

import core from '@anticrm/platform-core'
import presentation, { ComponentExtension } from '@anticrm/presentation'

// P L U G I N

export interface ActivityService extends Service {
}

const activityPlugin = plugin(
  'activity' as Plugin<ActivityService>,
  { core: core.id, presentation: presentation.id },
  {
    application: {
      Activity: '' as Ref<Application>
    },
    icon: {
      Activity: '' as Asset,
      ActivityView: '' as Asset
    },
    mixin: {
      ActivityInfo: '' as Ref<Mixin<ComponentExtension<VDoc>>>
    },
    component: {
      ActivityView: '' as AnyComponent,
      SpaceInfo: '' as AnyComponent
    }
  }
)

export default activityPlugin

export function getChunterService (): Promise<ActivityService> {
  return getPlatform().getPlugin(activityPlugin.id)
}
