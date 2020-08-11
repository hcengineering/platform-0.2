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

import { extendIds } from '@anticrm/platform-model'
import { Ref } from '@anticrm/platform'
import { Application } from '@anticrm/workbench'

import task, { Task } from '@anticrm/task'
import { IntlString } from '@anticrm/platform-i18n'
import { ClassUI } from '@anticrm/presentation-core'

export enum TaskDomain {
  Task = 'task'
}

export default extendIds(task, {
  application: {
    Task: '' as Ref<Application>
  },
  class: {
    Task: '' as Ref<ClassUI<Task>>
  },
  string: {
    Task_name: '' as IntlString,
    Task_assignee: '' as IntlString,
  }
})
