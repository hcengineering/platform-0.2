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

import { Class, Doc, plugin, Plugin, Ref, Service, StringProperty, VDoc, Mixin, Space } from '@anticrm/platform'
import ui, { AnyComponent, Asset } from '@anticrm/platform-ui'
import core from '@anticrm/platform-core'
import presentationUI from '@anticrm/presentation-ui'
import chunter from '@anticrm/chunter'

export interface Application extends Doc {
  label: StringProperty
  icon: Asset
  main: AnyComponent
  appClass: Ref<Class<VDoc>>
}

export interface WorkbenchCreateItem extends Doc {
  label: StringProperty
  icon: Asset
  itemClass: Ref<Class<VDoc>>
}

export interface SpaceExtension extends Space {
  component: AnyComponent
}

export interface WorkbenchService extends Service {
}

export default plugin('workbench' as Plugin<WorkbenchService>, {
  core: core.id, ui: ui.id, presentationUI: presentationUI.id, chunter: chunter.id
}, {
  class: {
    Application: '' as Ref<Class<Application>>,
    WorkbenchCreateItem: '' as Ref<Class<WorkbenchCreateItem>>
  },
  component: {
    Workbench: '' as AnyComponent,
    Browser: '' as AnyComponent,
    NewDocument: '' as AnyComponent,
  },
  icon: {
    Add: '' as Asset
  },
  mixin: {
    SpaceExtension: '' as Ref<Mixin<SpaceExtension>>
  }
})
