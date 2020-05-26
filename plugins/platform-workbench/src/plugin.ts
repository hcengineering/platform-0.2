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

import { Platform, Service } from '@anticrm/platform'
import { reactive } from 'vue'
import { CoreService, Doc, Ref, Instance, Class } from '@anticrm/platform-core'
import ui, { UIService, AnyComponent } from '@anticrm/platform-ui'

import workbench, { WorkbenchService, WorkbenchState, MainModel } from '.'
import Workbench from './components/Workbench.vue'
// import { LaunchPlugin } from '@anticrm/launch-dev'

console.log('PLUGIN: `workbench` parsed')
/*!
 * Anticrm Platform™ Workbench Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService, ui: UIService }): Promise<WorkbenchService> => {
  console.log('PLUGIN: `workbench` started')

  platform.setResource(workbench.component.Workbench, Workbench)

  // S T A T E

  const path = window.location.pathname
  const split = path.split('/')

  const session = deps.core.newSession()

  const obj = await session.getInstance(split[2] as Ref<Doc>)
  const clazz = await obj._class
  const form = session.as(clazz, ui.class.Form)

  const initState: WorkbenchState = {
    mainComponent: form.form
  }
  const state = reactive(initState)

  deps.ui.addState(workbench.id, state)


  // W O R K B E N C H  M O D E L

  return {
    getState () { return state }
  }
}
