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

import { Builder, getClass } from '@anticrm/model'
import { TTask, model as taskModel } from '@anticrm/core-model/src/__tests__/test_tasks'
import domains from '@anticrm/domains'

export function model (S: Builder): void {
  const tclass = getClass(TTask.prototype)
  tclass.postProcessing.push((model, classifier) => {
    model.mixinDocument(classifier, domains.mixin.Indices, { primary: 'name' })
  })
  taskModel(S)
}
