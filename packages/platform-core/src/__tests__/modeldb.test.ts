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

/* eslint-env jest */


import { ModelDb } from '../modeldb'
import { CoreDomain, Doc, Mixin, Ref, VDoc } from '@anticrm/platform'

import model from './model'

describe('modeldb', () => {

  it('should create mixin', () => {
    const modelDb = new ModelDb(CoreDomain.Model)
    modelDb.loadModel(model)
    const taskClass = modelDb.get('class:task.Task' as Ref<Doc>)
    const details = modelDb.as(taskClass, 'class:presentation-core.DetailsForm' as Ref<Mixin<VDoc>>) as any
    expect(details._id).toBe('class:task.Task')
    expect(details._extends).toBe('class:core.VDoc')
    expect(details.form).toBe('component:task.TaskDetails')
  })
})
