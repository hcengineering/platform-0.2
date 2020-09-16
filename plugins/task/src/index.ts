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

import { Metadata, plugin, Plugin, Resource, Service } from '@anticrm/platform'
import { StringProperty, Doc, Class, Ref, VDoc } from '@anticrm/core'
import { Application } from '@anticrm/platform-core'

import { User } from '@anticrm/contact'
import ui, { AnyComponent, Asset } from '@anticrm/platform-ui'
import { IntlString } from '@anticrm/platform-i18n'

export interface Task extends VDoc {
  title: StringProperty
  assignee: Ref<User>
}

export interface TaskService extends Service {
}

export default plugin('task' as Plugin<TaskService>, {}, {
})
