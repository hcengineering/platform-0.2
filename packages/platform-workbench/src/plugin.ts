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
import vue, { VueService, SessionInjectionKey, CoreInjectionKey, UIInjectionKey } from '@anticrm/platform-vue'

import workbench, { WorkbenchService } from '.'
import Workbench from './internal/Workbench.vue'

console.log('PLUGIN: `workbench` parsed')
/*!
 * Anticrm Platform™ Workbench Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService, ui: UIService, vue: VueService }): Promise<WorkbenchService> => {
  console.log('PLUGIN: `workbench` started')
  const coreService = deps.core

  platform.setResource(workbench.component.Workbench, Workbench)

  // V I E W  M O D E L

  // async function getViewModel (_class: Ref<Class<Doc>>, kind: ViewModelKind): Promise<ViewModel> {
  //   const clazz = await coreService.getInstance(_class)
  //   // if (!coreService.is(doc, ui.class.Form)) {
  //   //   doc = await doc._class
  //   // }
  //   if (!coreService.is(clazz, ui.class.Form)) {
  //     throw new Error(`something went wrong, can't find 'Form' for the ${_class}.`)
  //   }
  //   const component = (await coreService.as(clazz, ui.class.Form)).form
  //   //const object = clazz.newInstance()
  //   return {
  //     kind: ViewModelKind.NEW_FORM,
  //     component,
  //     content: {} as Doc
  //   }
  // }

  // W O R K B E N C H  M O D E L

  const session = deps.core.newSession()

  deps.vue.getApp()
    .provide(CoreInjectionKey, deps.core)
    .provide(UIInjectionKey, deps.ui)
    .provide(SessionInjectionKey, session)

  return {
    // getViewModel
  }
}
