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

import { model as taskModel } from '@anticrm/core-model/src/__tests__/test_tasks'
import { taskIds } from '@anticrm/core/src/__tests__/tasks'
import { Builder } from '@anticrm/model'
import { primary } from '..'

export function model (S: Builder): void {
  taskModel(S)
  // Mark name field as primary one.
  primary(S, taskIds.class.Task, (S) => S.name)
}
