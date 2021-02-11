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

import {
  TxProcessor,
  Tx,
  TxContext,
  Storage,
  Ref,
  StringProperty,
  AnyLayout,
  Class,
  Doc,
  Model,
  MODEL_DOMAIN,
  isValidQuery, DocumentProtocol
} from '@anticrm/core'
import { Collection, MongoClient } from 'mongodb'
import { withTenant } from '@anticrm/accounts'
import { createPullArrayFilters, createPushArrayFilters, createQuery, createSetArrayFilters } from './mongo_utils'

import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { ReferenceIndex } from '@anticrm/domains/src/indices/reference'
import { TitleIndex } from '@anticrm/domains/src/indices/title'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { ClientTxStorage } from '@anticrm/platform-core/src/clienttx'
import { PassthroughsIndex } from '@anticrm/domains/src/indices/filter'
import { CORE_CLASS_SPACE } from '@anticrm/domains'

export interface WorkspaceProtocol extends DocumentProtocol {

  tx (txContext: TxContext, tx: Tx): Promise<any>

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

  function collection<T extends Doc> (_class: Ref<Class<T>>): Collection {
    const domain = memdb.getDomain(_class)
    return db.collection(domain)
  }

  const mongoStorage: Storage = {
    async store (ctx: TxContext, doc: Doc): Promise<any> {
      return await collection(doc._class).insertOne(doc)
    },

    async push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<any> {
      if (isValidQuery(query)) {
        const filters = createPushArrayFilters(memdb, _class, query!, attribute, attributes)
        return collection(_class).updateOne({ _id }, { $push: filters.updateOperation }, { arrayFilters: filters.arrayFilters })
      }
      const value = {
        ...attributes
      }
      // We need to put attribute class as part of embedded object.
      const attr = memdb.classAttribute(_class, attribute)
      const attrClass = memdb.attributeClass(attr.attr.type)
      if (attrClass !== null) {
        value._class = attrClass // We need to have class for further operations to work well
      }
      return collection(_class).updateOne({ _id }, {
        $push: {
          [attr.key]: value
        }
      })
    },

    async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attributes: AnyLayout): Promise<any> {
      if (isValidQuery(query)) {
        const filters = createSetArrayFilters(memdb, _class, query!, attributes)
        return collection(_class).updateOne({ _id }, { $set: filters.updateOperation },
          { arrayFilters: filters.arrayFilter })
      }
      return collection(_class).updateOne({ _id }, { $set: attributes })
    },

    async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null): Promise<any> {
      if (isValidQuery(query)) {
        // Operation over embedded child object, path to it should be matched by query object.
        const filters = createPullArrayFilters(memdb, _class, query!)
        if (filters.isArrayAttr) {
          return await collection(_class).updateOne({ _id }, { $pull: filters.updateOperation }, { arrayFilters: filters.arrayFilters })
        } else {
          return collection(_class).updateOne({ _id }, { $unset: filters.updateOperation }, { arrayFilters: filters.arrayFilters })
        }
      }
      return collection(_class).deleteOne({ _id })
    },

    async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
      return collection(_class)
        .find({
          ...memdb.assign({}, _class, query),
          _class: memdb.getClass(_class)
        })
        .toArray()
    },

    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
      const res = await collection(_class)
        .findOne({
          ...memdb.assign({}, _class, query),
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
    new VDocIndex(memdb, mongoStorage),
    new TitleIndex(memdb, clientTxMongo),
    new ReferenceIndex(memdb, clientTxMongo),
    new PassthroughsIndex(memdb, mongoStorage, CORE_CLASS_SPACE),
    new ModelIndex(memdb, [memdb, mongoStorage])
  ])

  const clientControl = {
    // C O R E  P R O T O C O L

    find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
      return collection(_class)
        .find(createQuery(memdb, _class, query))
        .toArray()
    },

    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
      const result = await collection(_class).findOne(createQuery(memdb, _class, query))
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

    close (): Promise<void> {
      return client.close()
    },

    getModel: () => Promise.resolve(memdb)
  }

  return clientControl
}
