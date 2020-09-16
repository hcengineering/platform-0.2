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

import type { Platform } from '@anticrm/platform'
import workbench, { WorkbenchService } from '.'

import Workbench from './components/internal/Workbench.svelte'
import DefaultPerspective from './components/internal/DefaultPerspective.svelte'
import ActivityView from './components/internal/ActivityView.svelte'

/*!
 * Anticrm Platform™ Workbench Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<WorkbenchService> => {

  platform.setResource(workbench.component.Workbench, Workbench)
  platform.setResource(workbench.component.DefaultPerspective, DefaultPerspective)
  platform.setResource(workbench.component.ActivityView, ActivityView)

  return {}

}
