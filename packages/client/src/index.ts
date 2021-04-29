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

import { Class, CoreProtocol, Doc, DocumentProtocol, DocumentQuery, FindOptions, generateId as genId, Model, MODEL_DOMAIN, Ref, Tx, txContext, TxContextSource, TxProcessor } from '@anticrm/core'
import { CORE_CLASS_REFERENCE, CORE_CLASS_SPACE, CORE_CLASS_TITLE, TITLE_DOMAIN } from '@anticrm/domains'
import { PassthroughsIndex } from '@anticrm/domains/src/indices/filter'
import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { Service } from '@anticrm/platform'
import { Cache } from './cache'
import { ModelDb } from './modeldb'
import { createOperations, OperationProtocol } from './operations'
import { QueriableStorage, QueryProtocol, QueryResult } from './queries'
import { EventType, newCoreProtocol, newRawClient } from './rpc'

export * from '@anticrm/rpc'
export { OperationProtocol } from './operations'
export { QueryProtocol, QueryResult, QueryUpdater, Unsubscribe } from './queries'

export interface ClientService extends Service, CoreProtocol, QueryProtocol, DocumentProtocol, OperationProtocol {
  getModel: () => Model
  generateId: () => Ref<Doc>

  close: () => void
}

/**
 * @param token - A valid token to acces server
 * @param host  - a server host
 * @param port  - a server port
 * @returns
 */
export async function newClient (token: string, userId: string, host = 'localhost', port = 3000): Promise<ClientService> {
  const rawClient = newRawClient(token, host, port)

  const model = new ModelDb()
  const coreProtocol: CoreProtocol = newCoreProtocol(rawClient, model)

  // Storages
  const cache = new Cache(coreProtocol)

  const modelDomain = await coreProtocol.loadDomain(MODEL_DOMAIN)
  model.loadModel(modelDomain)

  const qModel = new QueriableStorage(model, model)
  const qTitles = new QueriableStorage(model, cache)
  const qCache = new QueriableStorage(model, cache, true)

  const domains = new Map<string, QueriableStorage>()
  domains.set(MODEL_DOMAIN, qModel)
  domains.set(TITLE_DOMAIN, qTitles)

  const txProcessor = new TxProcessor([
    new TxIndex(qCache),
    new VDocIndex(model, qCache),
    new PassthroughsIndex(model, qTitles, CORE_CLASS_TITLE), // Just for live queries.
    new PassthroughsIndex(model, qCache, CORE_CLASS_REFERENCE), // Construct a pass index to update references
    new PassthroughsIndex(model, qCache, CORE_CLASS_SPACE), // Construct a pass index to update references
    new ModelIndex(model, qModel)
  ])

  // add listener to process data updates from backend for data transactions.
  rawClient.addEventListener(EventType.Transaction, (result): void => {
    txProcessor.process(txContext(TxContextSource.Server), result as Tx) // eslint-disable-line
  })

  async function processTransactions (txs: Tx[]): Promise<void> {
    for (const tx of txs) {
      await txProcessor.process(txContext(TxContextSource.ServerTransient), tx)
    }
  }
  // Add a client transaction event listener
  rawClient.addEventListener(EventType.TransientTransaction, (txs: unknown): void => {
    processTransactions(txs as Tx[]) // eslint-disable-line
  })

  async function find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const domain = domains.get(model.getDomain(_class))
    return await (domain ?? qCache).find(_class, query, options)
  }

  async function findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const domain = domains.get(model.getDomain(_class))
    return await (domain ?? qCache).findOne(_class, query)
  }

  function query<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): QueryResult<T> {
    const domain = domains.get(model.getDomain(_class))
    return (domain ?? qCache).query(_class, query, options)
  }

  async function processTx (tx: Tx): Promise<any> {
    const networkComplete = coreProtocol.tx(tx)
    await Promise.all([
      networkComplete,
      txProcessor.process(txContext(TxContextSource.Client, networkComplete), tx)
    ])
  }

  const service: ClientService = {
    getModel: () => model,
    loadDomain: coreProtocol.loadDomain,
    query,
    find,
    findOne,
    ...createOperations(model, processTx, userId),
    generateId: genId,
    tx: processTx,
    genRefId: coreProtocol.genRefId,
    close: () => rawClient.close()
  }
  return service
}
