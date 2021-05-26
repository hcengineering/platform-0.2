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

import { Class, Enum, Mixin } from '@anticrm/core'
import { Task, TaskComment, TaskEstimate, taskIds, TaskMixin, TaskReproduce, TaskStatus } from '@anticrm/core/src/__tests__/tasks'
import { Builder } from '@anticrm/model'

export function model (S: Builder): void {
  S.loadEnum(__filename, taskIds.enum, {
    TaskReproduce: {} as Enum<TaskReproduce>, // eslint-disable-line
    TaskStatus: {} as Enum<TaskStatus> // eslint-disable-line
  })
  S.loadClass(__filename, taskIds.class, {
    Task: {} as Class<Task>, // eslint-disable-line
    TaskComment: {} as Class<TaskComment>, // eslint-disable-line
    TaskEstimate: {} as Class<TaskEstimate> // eslint-disable-line
  })

  S.loadMixin(__filename, taskIds.mixin, {
    TaskMixin: {} as Mixin<TaskMixin> // eslint-disable-line
  })
}
