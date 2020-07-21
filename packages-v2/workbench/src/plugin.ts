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
import { CoreService } from '@anticrm/platform-core'
import workbench, { WorkbenchService } from '.'
import { UIService } from '@anticrm/platform-ui'
import { PresentationUI } from '@anticrm/presentation-ui'

import { CoreInjectionKey, UIInjectionKey } from './utils'

import Workbench from './components/Workbench.vue'
import Browse from './components/Browse.vue'
import NewDocument from './components/NewDocument.vue'

/*!
 * Anticrm Platform™ Workbench Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: {
  core: CoreService, ui: UIService, presentationUI: PresentationUI
}): Promise<WorkbenchService> => {

  platform.setResource(workbench.component.Workbench, Workbench)

  platform.setResource(workbench.component.Browse, Browse)
  platform.setResource(workbench.component.NewDocument, NewDocument)

  deps.ui.getApp()
    .provide(CoreInjectionKey, deps.core)
    .provide(UIInjectionKey, deps.ui) // TODO: each plugin should be responible for it's own `provide`

  return {}
}
