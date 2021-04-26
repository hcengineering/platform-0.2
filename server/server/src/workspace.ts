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
  AnyLayout, Class, combineStorage, Doc, DocumentProtocol, DocumentQuery, FindOptions, Model, MODEL_DOMAIN, Ref, Storage, Tx,
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
import { Collection, MongoClient, SortOptionObject, UpdateOneOptions, UpdateQuery } from 'mongodb'
import type { FindAndModifyWriteOpResultObject } from 'mongodb'
import { createPullArrayFilters, createPushArrayFilters, createSetArrayFilters } from './mongo_utils'

export interface WorkspaceProtocol extends DocumentProtocol {

  tx: (txContext: TxContext, tx: Tx) => Promise<any>

  genRefId: (_space: Ref<Space>) => Promise<Ref<Doc>>

  close: () => Promise<void>

  getModel: () => Promise<Model>
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
    async store (ctx: TxContext, doc: Doc): Promise<any> {
      await collection(doc._class).insertOne(doc)
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

      return await collection(_class).updateOne({ _id }, updateOp, opts)
    },

    async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<any> {
      return await collection(_class).deleteOne({ _id })
    },

    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
      const { query: finalQuery, classes } = memdb.createQuery(_class, query, true)

      if (classes.length > 1) {
        // Replace _class query to find all suitable instances.
        (finalQuery as any)._class = { $in: classes }
      }

      // We should use aggregation and return a number of elements if we had limit or skip specified.
      if (options?.limit !== undefined || options?.skip !== undefined) {
        const resultQuery: any = [
          { $match: finalQuery },
          { $skip: options.skip ?? 0 }
        ]
        if (options?.limit !== undefined) {
          resultQuery.push({ $limit: options.limit ?? 0 })
        }
        if (options?.sort !== undefined) {
          resultQuery.push({ $sort: options.sort ?? {} })
        }
        const resultValue = collection(_class).aggregate<any>([{
          $facet: {
            results: resultQuery,
            totalCount: [
              { $match: finalQuery },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }])
        const resValue = (await resultValue.toArray())[0]

        // Notify callback about counts.
        if (options?.countCallback !== undefined) {
          if (resValue.totalCount.length > 0) {
            options.countCallback(options.skip ?? 0, options.limit ?? 0, resValue.totalCount[0].count)
          } else {
            options.countCallback(options.skip ?? 0, options.limit ?? 0, 0)
          }
        }

        return resValue.results
      }

      // Use standalone without limit and skip.
      let cursor = collection(_class).find(finalQuery)

      if (options?.sort !== undefined) {
        cursor = cursor.sort(options.sort as SortOptionObject<Doc>)
      }

      const values = await cursor.toArray()
      // Notify callback about counts.
      if (options?.countCallback !== undefined) {
        options.countCallback(0, 0, values.length)
      }
      return values
    },

    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const { query: finalQuery, classes } = memdb.createQuery(_class, query, true)

      if (classes.length > 0) {
        // Replace _class query to find all suitable instances.
        (query as any)._class = { $in: [classes] }
      }

      const result = await collection(_class).findOne<T>(finalQuery)
      if (result === null) {
        return undefined
      }
      return result
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

  const clientControl: WorkspaceProtocol = {
    // C O R E  P R O T O C O L

    find: mongoStorage.find,
    findOne: mongoStorage.findOne,

    async tx (txContext: TxContext, tx: Tx): Promise<any> {
      return await txProcessor.process(txContext, tx)
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN) return memdb.dump()
      console.log('domain:', domain)
      return await db.collection(domain).find({}).toArray()
    },

    async genRefId (_space: Ref<Space>): Promise<Ref<Doc>> {
      const space = await clientControl.findOne(CORE_CLASS_SPACE, { _id: _space })
      if (space === undefined) {
        return await Promise.reject(new Error('Space with id ' + _space + ' is not found'))
      }

      const getValue = async (): Promise<FindAndModifyWriteOpResultObject<any>> => {
        const res = await workspaceSystem.findOneAndUpdate(
          { _space },
          { $inc: { value: 1 } },
          { upsert: true }
        )
        return res
      }

      let res = await getValue()
      if (res.value === undefined) {
        res = await getValue()
      }
      return (`${space.spaceKey}-${String(res.value.value)}`) as Ref<VDoc>
    },

    async close (): Promise<void> {
      await client.close()
    },

    getModel: async (): Promise<Model> => {
      return await Promise.resolve(memdb)
    }
  }

  return clientControl
}
