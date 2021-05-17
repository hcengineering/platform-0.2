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

/* eslint-env jest */

import core, { Class, Doc, Model, Ref, txContext } from '@anticrm/core'
import { createTask, data, taskIds } from '@anticrm/core/src/__tests__/tasks'
import { ModelStorage } from '../model_storage'
import { getPrimaryKey } from '../primary_utils'
import { create, ObjectTx } from '../tx'

describe('core tests', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('returns primary key of class', () => {
    expect(getPrimaryKey(model, core.class.Emb))
      .toBeUndefined()
    expect(getPrimaryKey(model, 'core.class.TaskObj' as Ref<Class<Doc>>))
      .toEqual('name')
  })

  it('rejects on storing existing doc', async () => {
    const model = new Model('vdocs')
    const modelStore = new ModelStorage(model)
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, createTask('', 0, ''))

    const tx = create(doc._class, doc, doc._id) as ObjectTx
    await modelStore.tx(txContext(), tx)
    try {
      await modelStore.tx(txContext(), tx)
      expect(model).toBeUndefined()
    } catch (err) {
      expect(err.message).toEqual('document added already ' + tx._objectId)
    }
  })

  it('rejects on removing missing doc', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    try {
      model.del('id' as Ref<Doc>)
      expect(model).toBeUndefined()
    } catch (err) {
      expect(err.message).toEqual('document is not found id')
    }
  })
})
