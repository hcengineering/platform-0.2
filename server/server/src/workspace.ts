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

import { withTenant } from '@anticrm/accounts'
import {
  AnyLayout, Class, combineStorage, Doc, DocumentProtocol, DocumentQuery, Model, MODEL_DOMAIN, Ref, Storage, Tx,
  TxContext, TxProcessor
} from '@anticrm/core'
import { CORE_CLASS_SPACE, Space, TxOperation, TxOperationKind, VDoc } from '@anticrm/domains'
import { PassthroughsIndex } from '@anticrm/domains/src/indices/filter'
import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { ReferenceIndex } from '@anticrm/domains/src/indices/reference'
import { TitleIndex } from '@anticrm/domains/src/indices/title'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { ClientTxStorage } from '@anticrm/platform-core/src/clienttx'
import { Collection, MongoClient, UpdateOneOptions, UpdateQuery } from 'mongodb'
import { createPullArrayFilters, createPushArrayFilters, createSetArrayFilters } from './mongo_utils'

export interface WorkspaceProtocol extends DocumentProtocol {

  tx (txContext: TxContext, tx: Tx): Promise<any>

  genRefId (_space: Ref<Space>): Promise<Ref<Doc>>

  close (): Promise<void>

  getModel (): Promise<Model>
}

export async function connectWorkspace (uri: string, workspace: string): Promise<WorkspaceProtocol> {
  console.log('connecting to ' + uri)
  const client = await MongoClient.connect(uri, { useUnifiedTopology: true })
  const db = withTenant(client, workspace)
  console.log('use ' + db.databaseName)

  const memdb = new Model(MODEL_DOMAIN)
  console.log('loading model...')
  const model = await db.collection('model').find({}).toArray()
  console.log('model loaded.')
  memdb.loadModel(model)

  const workspaceSystem = db.collection('system')

  function collection<T extends Doc> (_class: Ref<Class<T>>): Collection {
    const domain = memdb.getDomain(_class)
    return db.collection(domain)
  }

  const mongoStorage: Storage = {
    store (ctx: TxContext, doc: Doc): Promise<any> {
      return collection(doc._class).insertOne(doc)
    },

    async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<any> {
      let setUpdateChain: any = {}
      let pushUpdateChain: any = {}
      let pullUpdateChain: any = {}
      let unsetUpdateChain: any = {}
      let index = 1

      const arrayFilters: AnyLayout[] = []
      for (const op of operations) {
        switch (op.kind) {
          case TxOperationKind.Set: {
            const filters = createSetArrayFilters(memdb, _class, op.selector, op._attributes, index)
            setUpdateChain = { ...setUpdateChain, ...filters.updateOperation }
            arrayFilters.push(...filters.arrayFilter)
            index = filters.index
            break
          }
          case TxOperationKind.Push: {
            const filters = createPushArrayFilters(memdb, _class, op.selector, op._attributes, index)
            pushUpdateChain = { ...pushUpdateChain, ...filters.updateOperation }
            arrayFilters.push(...filters.arrayFilters)
            break
          }
          case TxOperationKind.Pull: {
            const filters = createPullArrayFilters(memdb, _class, op.selector, index)
            if (filters.isArrayAttr) {
              pullUpdateChain = { ...pullUpdateChain, ...filters.updateOperation }
              arrayFilters.push(...filters.arrayFilters)
            } else {
              unsetUpdateChain = { ...unsetUpdateChain, ...filters.updateOperation }
              arrayFilters.push(...filters.arrayFilters)
            }
            break
          }
        }
      }

      const updateOp: UpdateQuery<any> = {}
      const opts: UpdateOneOptions = {}
      if (Object.keys(setUpdateChain).length > 0) {
        updateOp.$set = setUpdateChain
      }
      if (Object.keys(unsetUpdateChain).length > 0) {
        updateOp.$unset = unsetUpdateChain
      }
      if (Object.keys(pushUpdateChain).length > 0) {
        updateOp.$push = pushUpdateChain
      }
      if (Object.keys(pullUpdateChain).length > 0) {
        updateOp.$pull = pullUpdateChain
      }
      if (arrayFilters.length > 0) {
        opts.arrayFilters = arrayFilters
      }

      return collection(_class).updateOne({ _id }, updateOp, opts)
    },

    async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<any> {
      return collection(_class).deleteOne({ _id })
    },

    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T[]> {
      return collection(_class)
        .find({
          ...memdb.assign({}, _class, query as AnyLayout),
          _class: memdb.getClass(_class)
        })
        .toArray()
    },

    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const res = await collection(_class)
        .findOne({
          ...memdb.assign({}, _class, query as AnyLayout),
          _class: memdb.getClass(_class)
        })
      if (res === null) {
        return undefined
      }
      return res
    }
  }

  // Will construct a client transactions on derived data operations.
  const clientTxMongo = new ClientTxStorage(mongoStorage)

  const txProcessor = new TxProcessor([
    new TxIndex(mongoStorage),
    new VDocIndex(memdb, mongoStorage, clientTxMongo),
    new TitleIndex(memdb, clientTxMongo),
    new ReferenceIndex(memdb, clientTxMongo),
    new PassthroughsIndex(memdb, mongoStorage, CORE_CLASS_SPACE),
    new ModelIndex(memdb, combineStorage(memdb, mongoStorage))
  ])

  const clientControl = {
    // C O R E  P R O T O C O L

    find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T[]> {
      return collection(_class)
        .find(memdb.createQuery(_class, query, true))
        .toArray()
    },

    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const result = await collection(_class).findOne(memdb.createQuery(_class, query, true))
      if (result == null) {
        return undefined
      }
      return result
    },

    async tx (txContext: TxContext, tx: Tx): Promise<any> {
      return txProcessor.process(txContext, tx)
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN) return memdb.dump()
      console.log('domain:', domain)
      return db.collection(domain).find({}).toArray()
    },

    async genRefId (_space: Ref<Space>): Promise<Ref<Doc>> {
      const space = await clientControl.findOne(CORE_CLASS_SPACE, { _id: _space })
      if (!space) {
        return Promise.reject(new Error('Space with id ' + _space + ' is not found'))
      }

      function getValue () {
        return workspaceSystem.findOneAndUpdate(
          { _space },
          { $inc: { value: 1 } },
          { upsert: true }
        )
      }

      let res = await getValue()
      if (!res.value) {
        res = await getValue()
      }
      return (`${space.spaceKey}-${res.value.value}`) as Ref<VDoc>
    },

    close (): Promise<void> {
      return client.close()
    },

    getModel: () => Promise.resolve(memdb)
  }

  return clientControl
}
