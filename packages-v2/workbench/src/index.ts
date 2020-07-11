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

import { Class, Doc, plugin, Plugin, Ref, Resource, Service, StringProperty } from '@anticrm/platform'
import ui, { AnyComponent } from '@anticrm/platform-ui'
import core from '@anticrm/platform-core'

export interface Application extends Doc {
  label: StringProperty
  icon?: Resource<URL>
}

export interface WorkbenchService extends Service {
}

export default plugin('workbench' as Plugin<WorkbenchService>, {core: core.id, ui: ui.id}, {
  class: {
    Application: '' as Ref<Class<Application>>
  },
  component: {
    Workbench: '' as AnyComponent
  }
})
