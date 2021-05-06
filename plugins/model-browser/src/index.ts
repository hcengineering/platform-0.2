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

import { Ref } from '@anticrm/core'
import { plugin, Plugin, Service } from '@anticrm/platform'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import { WorkbenchApplication } from '@anticrm/workbench'

export interface ModelBrowserService extends Service {
}

export default plugin('modelBrowser' as Plugin<ModelBrowserService>, {}, {
  icon: {
    ModelBrowser: '' as Asset
  },
  component: {
    ModelBrowser: '' as AnyComponent,
    AttributePresenter: '' as AnyComponent,
    ClassProperties: '' as AnyComponent
  },
  application: {
    ModelBrowser: '' as Ref<WorkbenchApplication>
  }
})
