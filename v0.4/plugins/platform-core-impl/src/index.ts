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

import client, { ClientService, EventType } from '@anticrm/client'
import { Class, CoreProtocol, Doc, DocumentQuery, DomainProtocol, Emb, FindOptions, Model, MODEL_DOMAIN, Ref, Tx, txContext, TxContextSource, TxProcessor } from '@anticrm/core'
import domainsIds, { CollectionId, TITLE_DOMAIN } from '@anticrm/domains'
import { PassthroughsIndex } from '@anticrm/domains/src/indices/filter'
import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { getMetadata, getPlugin } from '@anticrm/platform'
import core, { CoreService, QueryResult } from '@anticrm/platform-core'
import { Cache } from './cache'
import { QueriableStorage } from './queries'

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (): Promise<CoreService> => {
  const clientService = await getPlugin<ClientService>(client.id)

  const model = new Model(MODEL_DOMAIN)

  const coreProtocol: CoreProtocol & DomainProtocol = {
    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
      const result = await clientService.find<T>(_class, query, options)
      return result.map((it) => model.as(it, _class))
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const result = await clientService.findOne<T>(_class, query)
      if (result !== undefined) {
        return model.as(result, _class)
      }
      return result
    },
    async findIn<T extends Doc, C extends Emb>(
      _class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>,
      _itemClass: Ref<Class<C>>, query: DocumentQuery<C>,
      options?: FindOptions<C>): Promise<C[]> {
      const result = await clientService.findIn<T, C>(_class, _id, _collection, _itemClass, query, options)
      return result.map((it) => model.as(it, _itemClass))
    },
    tx: clientService.tx,
    loadDomain: clientService.loadDomain,
    genRefId: clientService.genRefId
  }

  // Storages
  const cache = new Cache(coreProtocol)

  const modelDomain = await coreProtocol.loadDomain(MODEL_DOMAIN)
  model.loadModel(modelDomain)

  const qModel = new QueriableStorage(model, cache, true)
  const qTitles = new QueriableStorage(model, cache)
  const qCache = new QueriableStorage(model, cache, true)

  const domains = new Map<string, QueriableStorage>()
  domains.set(MODEL_DOMAIN, qModel)
  domains.set(TITLE_DOMAIN, qTitles)

  const txProcessor = new TxProcessor([
    new TxIndex(qCache),
    new VDocIndex(model, qCache),
    new PassthroughsIndex(model, qTitles, domainsIds.class.Title), // Just for live queries.
    new PassthroughsIndex(model, qCache, domainsIds.class.Reference), // Construct a pass index to update references
    new ModelIndex(model, qModel)
  ])

  // add listener to process data updates from backend for data transactions.
  clientService.addEventListener(EventType.Transaction, (result): void => {
    txProcessor.process(txContext(TxContextSource.Server), result as Tx) // eslint-disable-line
  })

  async function processTransactions (txs: Tx[]): Promise<void> {
    for (const tx of txs) {
      await txProcessor.process(txContext(TxContextSource.ServerTransient), tx)
    }
  }
  // Add a client transaction event listener
  clientService.addEventListener(EventType.TransientTransaction, (txs: unknown): void => {
    processTransactions(txs as Tx[]) // eslint-disable-line
  })

  async function find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const domain = domains.get(model.getDomain(_class))
    return await (domain ?? qCache).find(_class, query, options)
  }

  async function findIn <T extends Doc, C extends Emb> (
    _class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>,
    _itemClass: Ref<Class<C>>, query: DocumentQuery<C>,
    options?: FindOptions<C>): Promise<C[]> {
    const domain = domains.get(model.getDomain(_class))
    return await (domain ?? qCache).findIn<T, C>(_class, _id, _collection, _itemClass, query, options)
  }

  async function findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const domain = domains.get(model.getDomain(_class))
    return await (domain ?? qCache).findOne(_class, query)
  }

  function query<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): QueryResult<T> {
    const domain = domains.get(model.getDomain(_class))
    return (domain ?? qCache).query(_class, query, options)
  }
  function queryIn <T extends Doc, C extends Emb> (_class: Ref<Class<T>>, _id: Ref<Class<T>>, _collection: CollectionId<T>, _itemClass: Ref<Class<C>>, query: DocumentQuery<C>, options?: FindOptions<C>): QueryResult<C> {
    const domain = domains.get(model.getDomain(_class))
    return (domain ?? qCache).queryIn(_class, _id, _collection, _itemClass, query, options)
  }

  function generateId (): Ref<Doc> {
    return clientService.generateId()
  }

  async function processTx (tx: Tx): Promise<any> {
    const networkComplete = coreProtocol.tx(tx)
    await Promise.all([
      networkComplete,
      txProcessor.process(txContext(TxContextSource.Client, networkComplete), tx)
    ])
  }

  function getUserId (): string {
    return getMetadata(core.metadata.WhoAmI) ?? '#unknown'
  }

  async function loadDomain (domain: string): Promise<Doc[]> {
    return await coreProtocol.loadDomain(domain)
  }

  async function genRefId (domain: string): Promise<Ref<Doc>> {
    return await coreProtocol.genRefId(domain)
  }

  return {
    getModel: () => model,
    loadDomain,
    query,
    queryIn,
    find,
    findIn,
    findOne,
    generateId,
    tx: processTx,
    getUserId,
    genRefId
  }
}
