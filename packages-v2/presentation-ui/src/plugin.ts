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

import { computed, ref, watch } from 'vue'
import { Class, Obj, Platform, Ref } from '@anticrm/platform'
import { ClassModel, PresentationCore } from '@anticrm/presentation-core'
import { UIService } from '@anticrm/platform-ui'

import { PresentationCoreInjectionKey, PresentationUIInjectionKey } from './utils'
import ui, { PresentationUI } from '.'

import Table from './components/Table.vue'

/*!
 * Anticrm Platform™ Presentation Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { ui: UIService, presentationCore: PresentationCore }): Promise<PresentationUI> => {

  platform.setResource(ui.components.Table, Table)

  const coreService = deps.presentationCore

  function getClassModel(props: { _class: Ref<Class<Obj>> }, onChange?: (model: ClassModel) => ClassModel) {
    const emptyModel = coreService.getEmptyModel()
    const model = ref(emptyModel)

    // following async code does not trigger on `_class` prop change, so we use `watch`
    // the issue is that watching props is a kind of nonsense (because props) are formally constants.
    // so, the trick for now is to make computed and watch it... we need to revisit this later.

    watch(computed(() => props._class), () => {
       coreService.getClassModel(props._class, 'class:core.VDoc' as Ref<Class<Obj>>)
         .then(m => {
           model.value = onChange ? onChange(m) : m
         })
         .catch(err => {
           platform.setPlatformStatus(err)
         })
    }, {immediate: true})

    return model
  }

  const service = {
    getClassModel
  }

  deps.ui.getApp()
    .provide(PresentationCoreInjectionKey, coreService)
    .provide(PresentationUIInjectionKey, service)

  return service
}