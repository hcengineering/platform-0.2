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
import { CoreService } from '@anticrm/platform-core'
import activity, { ActivityService } from '.'

import ActivityView from './components/internal/ActivityView.svelte'
import SpaceInfo from './components/internal/SpaceInfo.svelte'

export default async (platform: Platform, deps: { core: CoreService }): Promise<ActivityService> => { // eslint-disable-line @typescript-eslint/no-unused-vars
  platform.setResource(activity.component.ActivityView, ActivityView)
  platform.setResource(activity.component.SpaceInfo, SpaceInfo)

  return {}
}
