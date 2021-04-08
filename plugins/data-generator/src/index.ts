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

import { plugin, Plugin, Service } from '@anticrm/platform'
import { AnyComponent, Asset } from '@anticrm/platform-ui'

import _core from '@anticrm/platform-core'
import _task from '@anticrm/task'
// import _chunter from '@anticrm/chunter'
import _contact from '@anticrm/contact'
import { Ref } from '@anticrm/core'
import { WorkbenchApplication } from '@anticrm/workbench'

// P L U G I N

export interface DataGenService extends Service {
}

const dataGenPlugin = plugin(
  'data-generator' as Plugin<DataGenService>,
  {
    core: _core.id,
    task: _task.id,
    // chunter: _chunter.id,
    contact: _contact.id
  },
  {
    icon: {
      DataGen: '' as Asset
    },
    component: {
      DataGenView: '' as AnyComponent
    },
    application: {
      DataGen: '' as Ref<WorkbenchApplication>
    }
  }
)
export default dataGenPlugin
