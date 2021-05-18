//
// Copyright © 2021 Anticrm Platform Contributors.
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

import { Doc, DocumentQuery, FindOptions, Model, SortingOrder, txContext } from '@anticrm/core'
import { createTask, data, Task, taskIds } from '@anticrm/core/src/__tests__/tasks'
import { create, ModelStorage, remove, update } from '@anticrm/domains'
import { QueriableStorage } from '../queries'

/* eslint-env jest */

async function prepare (): Promise<{ model: Model, storage: QueriableStorage, docs: Doc[] }> {
  const model = new Model('vdocs')
  await model.loadModel(data)
  const docs: Doc[] = []

  for (let i = 0; i < 50; i++) {
    const tt = createTask(`t${i}`, 30, `task ${i}`)
    const t = model.createDocument<Task>(taskIds.class.Task, tt)

    if (i % 3 === 0) {
      t.rate = 33
    } else if (i % 34 === 0) {
      t.rate = 34
    }
    model.add(t)
    docs.push(t)
  }

  const storage = new QueriableStorage(model, new ModelStorage(model), true)
  return { model, storage, docs }
}

async function doQuery (storage: QueriableStorage, query: DocumentQuery<Task>, op: (docs: Task[]) => void, options?: FindOptions<Task>): Promise<void> {
  const result = storage.query<Task>(taskIds.class.Task, query, options)
  const p1: Promise<Task[]> = new Promise(resolve => {
    result.subscribe((docs) => {
      resolve(docs)
      op(docs)
    })
  })
  // Checks
  const docs = await p1
  expect(docs).toBeDefined()
}

describe('live queries', () => {
  it('check store op', async () => {
    /**
     * Check if store will trigger live query update, and it will be one one update during store
     */
    const { storage } = await prepare()

    let lastDocs: Doc[] = []
    let ops = 0
    await doQuery(storage, {}, (docs) => { lastDocs = docs; ops++ })
    expect(lastDocs.length).toEqual(50)

    await storage.tx(txContext(), create<Task>(taskIds.class.Task, createTask('EXTRA', 31, 'EXTRA')))

    expect(lastDocs.length).toEqual(51)
    expect(ops).toEqual(1 + 1)
  })
  it('check store limit', async () => {
    /**
     * Check if store will trigger live query update, Enable limit to 10 items and
     * check it will be no updates.
     */
    const { storage } = await prepare()

    let lastDocs: Doc[] = []
    let ops = 0
    await doQuery(storage, {}, (docs) => { lastDocs = docs; ops++ }, { limit: 10 })
    expect(lastDocs.length).toEqual(10)

    await storage.tx(txContext(), create<Task>(taskIds.class.Task, createTask('EXTRA', 31, 'EXTRA')))

    expect(lastDocs.length).toEqual(10)
    expect(ops).toEqual(1 + 1)
  })
  it('check remove limit', async () => {
    /**
      * Check if remove will trigger live query update, with limit to 10 items and
      * check it will be 2 updates, since we need info from server.
      */
    const { storage } = await prepare()

    let lastDocs: Doc[] = []
    let ops = 0
    await doQuery(storage, {}, (docs) => { lastDocs = docs; ops++ }, { limit: 10 })
    expect(lastDocs.length).toEqual(10)

    await storage.tx(txContext(), remove(lastDocs[0]._class, lastDocs[0]._id))

    expect(lastDocs.length).toEqual(10)
    expect(ops).toEqual(1 + 2)
  })
  it('check update fit', async () => {
    /**
     * Check what update operation on object in query and will trigger
     * live query update and no server refresh will happen
     */
    const { storage, docs: sourceDocs } = await prepare()

    let lastDocs: Doc[] = []
    let opdates = 0
    await doQuery(storage, { rate: 33 }, (docs) => { lastDocs = docs; opdates++ })
    expect(lastDocs.length).toEqual(17)

    const d = sourceDocs[1]
    await storage.tx(txContext(), update<Task>(d._class, d._id, { rate: 33 }))

    expect(opdates).toEqual(1 + 1) // We should have only two updates happening

    expect(lastDocs.length).toEqual(18)
  })
  it('check update miss', async () => {
    /**
     * Check what update operation on object (will not match after update) will
     * trigger live query update and no server update is required.
     */
    const { storage } = await prepare()

    let lastDocs: Doc[] = []
    let opdates = 0
    await doQuery(storage, { rate: 33 }, (docs) => { lastDocs = docs; opdates++ })
    expect(lastDocs.length).toEqual(17)

    const d = lastDocs[0]
    await storage.tx(txContext(), update<Task>(d._class, d._id, { rate: 34 }))

    expect(opdates).toEqual(1 + 1) // We should have only two updates happening

    expect(lastDocs.length).toEqual(16)
  })
  it('check update not fit', async () => {
    /**
     * Check what update on object not in query results will not trigger update in case
     * modify operation is not partially matched.
     */
    const { storage, docs: sourceDocs } = await prepare()

    let lastDocs: Doc[] = []
    let opdates = 0
    await doQuery(storage, { rate: 33 }, (docs) => { lastDocs = docs; opdates++ })
    expect(lastDocs.length).toEqual(17)

    const d = sourceDocs[1]
    await storage.tx(txContext(), update<Task>(d._class, d._id, { rate: 34 }))

    expect(opdates).toEqual(1) // We should have only two updates happening

    expect(lastDocs.length).toEqual(17)
  })

  it('check update not fit limit', async () => {
    /**
     * Check what update on document( will not match query) in query results with limit will trigger
     * server update.
     */
    const { storage } = await prepare()

    let lastDocs: Doc[] = []
    let opdates = 0
    await doQuery(storage, { rate: 33 }, (docs) => { lastDocs = docs; opdates++ }, { limit: 10 })
    expect(lastDocs.length).toEqual(10)

    const d = lastDocs[1]
    await storage.tx(txContext(), update<Task>(d._class, d._id, { rate: 34 }))

    expect(opdates).toEqual(1 + 2) // We have +2 updates, since remove and server update since we have more results.

    expect(lastDocs.length).toEqual(10)
  })
  it('check update fit multi query', async () => {
    /**
     * Check live query update is working fine with multiple live queries.
     */
    const { storage, docs: sourceDocs } = await prepare()

    let lastDocs: Doc[] = []
    let lastDocs2: Doc[] = []
    let opdates = 0
    let opdates2 = 0
    await doQuery(storage, { rate: 33 }, (docs) => { lastDocs = docs; opdates++ })
    expect(lastDocs.length).toEqual(17)

    await doQuery(storage, { rate: 34 }, (docs) => { lastDocs2 = docs; opdates2++ })
    expect(lastDocs2.length).toEqual(1)

    const d = sourceDocs[1]
    await storage.tx(txContext(), update<Task>(d._class, d._id, { rate: 34 }))

    expect(opdates).toEqual(1) // We have only 1 updates
    expect(opdates2).toEqual(1 + 1) // We have only 2 updates

    expect(lastDocs2.length).toEqual(2)
  })
  it('check sorting extra request', async () => {
    /**
     * Check if sorting has potential effect on results will trigger server update.
     */
    const { storage } = await prepare()

    let lastDocs: Doc[] = []
    let opdates = 0
    await doQuery(storage, { }, (docs) => { lastDocs = docs; opdates++ }, {
      limit: 10, sort: { rate: SortingOrder.Ascending }
    })
    expect(lastDocs.length).toEqual(10)

    const d = lastDocs[1]
    await storage.tx(txContext(), update<Task>(d._class, d._id, { rate: 30 }))

    expect(opdates).toEqual(1 + 2) //

    expect(lastDocs.length).toEqual(10)
  })
})
