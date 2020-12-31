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

import { plugin, Plugin, Service } from '@anticrm/platform'
import { Doc, Class, Ref } from '@anticrm/model'

import core from '@anticrm/platform-core'
import ui, { AnyComponent, Asset } from '@anticrm/platform-ui'
import { IntlString } from '@anticrm/platform-i18n'
import { Application, VDoc } from '@anticrm/core'

export interface Perspective extends Doc {
  label: IntlString
  icon?: Asset
  component: AnyComponent
}

export interface WorkbenchApplication extends Application {
  label: IntlString
  icon?: Asset
  component: AnyComponent
  classes: Ref<Class<VDoc>>[]
}

export interface WorkbenchService extends Service {
}

export default plugin('workbench' as Plugin<WorkbenchService>, { core: core.id, ui: ui.id }, {
  icon: {
    DefaultPerspective: '' as Asset,
    Add: '' as Asset
  },
  component: {
    Workbench: '' as AnyComponent,
    DefaultPerspective: '' as AnyComponent,
    CreateSpace: '' as AnyComponent,
    Application: '' as AnyComponent,
    CreateForm: '' as AnyComponent,
  },
  class: {
    Perspective: '' as Ref<Class<Perspective>>,
    WorkbenchApplication: '' as Ref<Class<WorkbenchApplication>>
  },
  application: {
    Activity: '' as Ref<WorkbenchApplication>,
    Chat: '' as Ref<WorkbenchApplication>
  }
})
