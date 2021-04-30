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
import Dashboard, { DashboardService } from '.'

import DashboardView from './components/DashboardView.svelte'
import SpaceInfo from './components/SpaceInfo.svelte'

export default (platform: Platform, deps: { core: CoreService }): Promise<DashboardService> => { // eslint-disable-line @typescript-eslint/no-unused-vars
  platform.setResource(Dashboard.component.DashboardView, DashboardView)
  platform.setResource(Dashboard.component.SpaceInfo, SpaceInfo)

  const service = {}

  return Promise.resolve(service)
}
