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

import {
  AnyLayout, Class, Doc, generateId, mixinKey, Model, Property, Ref, StringProperty, txContext
} from '@anticrm/core'
import { data, doc1, taskIds } from '@anticrm/core/src/__tests__/tasks'
import { TitleIndex } from '../indices/title'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_TITLE, CORE_CLASS_UPDATE_TX, CORE_MIXIN_SHORTID, CreateTx,
  DeleteTx, TxOperation, TxOperationKind, UpdateTx
} from '../index'

const model = new Model('vdocs')
model.loadModel(data)

function newCTx (_class: Ref<Class<Doc>>, _id: Ref<Doc>, object: AnyLayout): CreateTx {
  return {
    _class: CORE_CLASS_CREATE_TX,
    _id: generateId() as Ref<Doc>,
    _date: Date.now() as Property<number, Date>,
    _user: 'system' as StringProperty,
    _objectId: _id,
    _objectClass: _class,
    object: object
  }
}

function newUTx (_class: Ref<Class<Doc>>, _id: Ref<Doc>, object: AnyLayout): UpdateTx {
  return {
    _class: CORE_CLASS_UPDATE_TX,
    _id: generateId() as Ref<Doc>,
    _date: Date.now() as Property<number, Date>,
    _user: 'system' as StringProperty,
    _objectId: _id,
    _objectClass: _class,
    operations: [{
      kind: TxOperationKind.Set,
      _attributes: object
    } as TxOperation]
  }
}

function newDTx (_class: Ref<Class<Doc>>, _id: Ref<Doc>): DeleteTx {
  return {
    _class: CORE_CLASS_DELETE_TX,
    _id: generateId() as Ref<Doc>,
    _date: Date.now() as Property<number, Date>,
    _user: 'system' as StringProperty,
    _objectId: _id,
    _objectClass: _class
  }
}

describe('title-index tests', () => {
  it('verify title create', async () => {
    const memDb = new Model('test')
    memDb.loadModel(model.dump())

    const index = new TitleIndex(model, memDb)
    const shortIdKey = mixinKey(CORE_MIXIN_SHORTID, 'shortId')
    const titledDoc = { ...doc1, [shortIdKey]: 'TASK-1', _mixins: [CORE_MIXIN_SHORTID] }

    await index.tx(txContext(), newCTx(taskIds.class.Task, doc1._id, (titledDoc as unknown) as AnyLayout))

    const titles = await memDb.find(CORE_CLASS_TITLE, {})
    expect(titles.length).toEqual(2)
    expect(titles[0].title).toEqual('TASK-1')
    expect(titles[1].title).toEqual('my-space')
  })

  it('verify title update', async () => {
    const memDb = new Model('test')
    memDb.loadModel(model.dump())
    memDb.add({ ...doc1 })
    memDb.add({
      _class: CORE_CLASS_TITLE,
      _id: 'primary:d1' as Ref<Doc>,
      _objectClass: taskIds.class.Task,
      _objectId: 'd1',
      title: 'my-space'
    } as Doc)
    memDb.add({
      _class: CORE_CLASS_TITLE,
      _id: '602d5a5a3e1cca343b3e9be8' as Ref<Doc>,
      _objectClass: taskIds.class.Task,
      _objectId: 'd1',
      title: 'TASK-1'
    } as Doc)
    const index = new TitleIndex(model, memDb)

    const shortIdKey = mixinKey(CORE_MIXIN_SHORTID, 'shortId')

    await index.tx(txContext(), newUTx(taskIds.class.Task, doc1._id, {
      name: 'new-name' as StringProperty,
      [shortIdKey]: 'SPACE-2' as StringProperty,
      _mixins: [CORE_MIXIN_SHORTID]
    }))

    const titles = await memDb.find(CORE_CLASS_TITLE, {})
    expect(titles.length).toEqual(3)
    const named = titles.map(t => t.title).sort()
    expect(named).toEqual(['SPACE-2', 'TASK-1', 'new-name'])
  })
  it('verify other update', async () => {
    const memDb = new Model('test')
    memDb.loadModel(model.dump())
    memDb.add(doc1)
    memDb.add({
      _class: CORE_CLASS_TITLE,
      _id: 'primary:d1' as Ref<Doc>,
      _objectClass: taskIds.class.Task,
      _objectId: 'd1',
      title: 'my-space'
    } as Doc)
    memDb.add({
      _class: CORE_CLASS_TITLE,
      _id: '602d5a5a3e1cca343b3e9be8' as Ref<Doc>,
      _objectClass: taskIds.class.Task,
      _objectId: 'd1',
      title: 'TASK-1'
    } as Doc)
    const index = new TitleIndex(model, memDb)
    await index.tx(txContext(), newUTx(taskIds.class.Task, doc1._id, {}))

    const titles = await memDb.find(CORE_CLASS_TITLE, {})
    expect(titles.length).toEqual(2)
  })

  it('verify title delete', async () => {
    const memDb = new Model('test')
    memDb.loadModel(model.dump())
    memDb.add({ ...doc1 })
    memDb.add({
      _class: CORE_CLASS_TITLE,
      _id: 'primary:d1' as Ref<Doc>,
      _objectClass: taskIds.class.Task,
      _objectId: 'd1',
      title: 'my-space'
    } as Doc)
    memDb.add({
      _class: CORE_CLASS_TITLE,
      _id: '602d5a5a3e1cca343b3e9be8' as Ref<Doc>,
      _objectClass: taskIds.class.Task,
      _objectId: 'd1',
      title: 'TASK-1'
    } as Doc)
    const index = new TitleIndex(model, memDb)
    await index.tx(txContext(), newDTx(taskIds.class.Task, doc1._id))

    const titles = await memDb.find(CORE_CLASS_TITLE, {})
    expect(titles.length).toEqual(0)
  })
})
