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

import { EventType, newClient } from '@anticrm/client'
import { Class, CoreProtocol, Doc, DocumentQuery, FindOptions, Model, MODEL_DOMAIN, Ref, Tx, txContext, TxContextSource, TxProcessor } from '@anticrm/core'
import { CORE_CLASS_REFERENCE, CORE_CLASS_SPACE, CORE_CLASS_TITLE, Space, TITLE_DOMAIN, VDoc } from '@anticrm/domains'
import { PassthroughsIndex } from '@anticrm/domains/src/indices/filter'
import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { createOperations } from '@anticrm/domains/src/tx/operations'
import { PlatformStatusCodes } from '@anticrm/foundation'
import { Platform, PlatformStatus, Severity, Status } from '@anticrm/platform'
import { Cache } from './cache'
import core, { CoreService, QueryResult } from './index'
import { QueriableStorage } from './queries'
/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const host = platform.getMetadata(core.metadata.WSHost) ?? 'localhost'
  const sPort = platform.getMetadata(core.metadata.WSPort) ?? '18080'

  const token = platform.getMetadata(core.metadata.Token)

  const userId = platform.getMetadata(core.metadata.WhoAmI) as string

  if (token === undefined) {
    platform.broadcastEvent(PlatformStatus, new Status(Severity.ERROR, PlatformStatusCodes.AUTHENTICATON_REQUIRED, 'Authentication is required'))
    return await Promise.reject(new Error('authentication required'))
  }

  const rpc = await newClient(token, host, parseInt(sPort))
  const model = new Model(MODEL_DOMAIN)

  const coreProtocol: CoreProtocol = {
    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
      const result = await rpc.find<T>(_class, query, options)
      return result.map((it) => model.as(it, _class))
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const result = await rpc.findOne<T>(_class, query)
      if (result !== undefined) {
        return model.as(result, _class)
      }
      return result
    },
    tx: rpc.tx,
    loadDomain: rpc.loadDomain,
    genRefId: rpc.genRefId
  }

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
  rpc.addEventListener(EventType.Transaction, (result): void => {
    txProcessor.process(txContext(TxContextSource.Server), result as Tx) // eslint-disable-line
  })

  async function processTransactions (txs: Tx[]): Promise<void> {
    for (const tx of txs) {
      await txProcessor.process(txContext(TxContextSource.ServerTransient), tx)
    }
  }
  // Add a client transaction event listener
  rpc.addEventListener(EventType.TransientTransaction, (txs: unknown): void => {
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

  function generateId (): Ref<Doc> {
    return rpc.generateId()
  }

  async function processTx (tx: Tx): Promise<any> {
    const networkComplete = coreProtocol.tx(tx)
    await Promise.all([
      networkComplete,
      txProcessor.process(txContext(TxContextSource.Client, networkComplete), tx)
    ])
  }

  function getUserId (): string {
    return userId
  }

  const ops = createOperations(model, processTx, userId)

  async function loadDomain (domain: string): Promise<Doc[]> {
    return await coreProtocol.loadDomain(domain)
  }

  async function genRefId (_space: Ref<Space>): Promise<Ref<VDoc>> {
    return await coreProtocol.genRefId(_space)
  }

  return {
    getModel: () => model,
    loadDomain,
    query,
    find,
    findOne,
    ...ops,
    generateId,
    tx: processTx,
    getUserId,
    genRefId
  }
}
