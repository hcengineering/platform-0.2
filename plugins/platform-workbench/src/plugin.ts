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
import { CoreService, Obj, Doc, Ref, Instance, Class } from '@anticrm/platform-core'
import ui, { UIService, AnyComponent } from '@anticrm/platform-ui'
import vue, { VueService, SessionInjectionKey, CoreInjectionKey, UIInjectionKey, I18nInjectionKey } from '@anticrm/platform-vue'
import { I18nService } from '@anticrm/platform-core-i18n'
import { logout } from '@anticrm/platform-login'

import workbench, { WorkbenchService } from '.'
import Workbench from './internal/Workbench.vue'

console.log('PLUGIN: `workbench` parsed')
/*!
 * Anticrm Platform™ Workbench Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService, i18n: I18nService, ui: UIService, vue: VueService }): Promise<WorkbenchService> => {
  console.log('PLUGIN: `workbench` started')
  const coreService = deps.core

  platform.setResource(workbench.component.Workbench, Workbench)

  // A C T I O N S

  platform.setResource(workbench.method.Logout, () => {
    logout(deps.vue)
  })

  const session = deps.core.newSession()

  deps.vue.getApp()
    .provide(CoreInjectionKey, deps.core)
    .provide(I18nInjectionKey, deps.i18n)
    .provide(UIInjectionKey, deps.ui)
    .provide(SessionInjectionKey, session)

  return {
    // getViewModel
  }
}
