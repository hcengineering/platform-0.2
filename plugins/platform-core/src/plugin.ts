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

import { Platform } from '@anticrm/platform'
import { ModelDb } from './modeldb'

import { CoreService, QueryResult, RefFinalizer } from '.'
import login from '@anticrm/login'
import rpcService, { EventType } from './rpc'

import { QueriableStorage } from './queries'

import { Cache } from './cache'
import { Titles } from './titles'
import {
  Tx, txContext, TxContextSource,
  Ref,
  Class,
  Doc,
  AnyLayout,
  StringProperty, MODEL_DOMAIN,
  CoreProtocol, TxProcessor,
  generateId as genId
} from '@anticrm/core'
import { CORE_CLASS_REFERENCE, TITLE_DOMAIN } from '@anticrm/domains'

import { createOperations } from './operations'

import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { RPC_CALL_FIND, RPC_CALL_FINDONE, RPC_CALL_LOAD_DOMAIN, RPC_CALL_TX } from '@anticrm/rpc'
import { TitleIndex } from '@anticrm/domains/src/indices/title'
import { FilterIndex } from '@anticrm/domains/src/indices/filter'

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const rpc = rpcService(platform)

  const coreProtocol: CoreProtocol = {
    find: <T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> => rpc.request(RPC_CALL_FIND, _class, query),
    findOne: <T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> => rpc.request(RPC_CALL_FINDONE, _class, query),
    tx: (tx: Tx): Promise<any> => rpc.request(RPC_CALL_TX, tx),
    loadDomain: (domain: string): Promise<Doc[]> => rpc.request(RPC_CALL_LOAD_DOMAIN, domain)
  }

  // Storages

  const model = new ModelDb()
  const titles = new Titles(model)
  const cache = new Cache(coreProtocol)

  const modelDomain = await coreProtocol.loadDomain(MODEL_DOMAIN)
  model.loadModel(modelDomain)

  coreProtocol.loadDomain(TITLE_DOMAIN).then(docs => {
    const ctx = txContext()
    for (const doc of docs) {
      titles.store(ctx, doc)
    }
  })

  const qModel = new QueriableStorage(model, model)
  const qTitles = new QueriableStorage(model, titles)
  const qCache = new QueriableStorage(model, cache, true)

  // const queriables = [qModel, qTitles, qGraph, qCache]

  const domains = new Map<string, QueriableStorage>()
  domains.set(MODEL_DOMAIN, qModel)
  domains.set(TITLE_DOMAIN, qTitles)

  const txProcessor = new TxProcessor([
    new TxIndex(qCache),
    new VDocIndex(model, qCache),
    new TitleIndex(model, qTitles),
    new FilterIndex(model, qCache, CORE_CLASS_REFERENCE), // Construct a filter index to update references
    new ModelIndex(model, [qModel])
  ])

  // add listener to process data updates from backend for data transactions.
  rpc.addEventListener(EventType.Transaction, result => {
    txProcessor.process(txContext(TxContextSource.Server), result as Tx)
  })

  // Add a client transaction event listener
  rpc.addEventListener(EventType.TransientTransaction, txs => {
    for (const tx of (txs as Tx[])) {
      txProcessor.process(txContext(TxContextSource.ServerTransient), tx)
    }
  })

  function find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    const domainName = model.getDomain(_class)
    const domain = domains.get(domainName)
    if (domain) {
      return domain.find(_class, query)
    }
    return cache.find(_class, query)
  }

  function findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
    const domainName = model.getDomain(_class)
    const domain = domains.get(domainName)
    if (domain) {
      return domain.findOne(_class, query)
    }
    return cache.findOne(_class, query)
  }

  function query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    const domainName = model.getDomain(_class)
    const domain = domains.get(domainName)
    if (domain) {
      return domain.query(_class, query)
    }
    return qCache.query(_class, query)
  }

  function subscribe<T extends Doc> (_class: Ref<Class<T>>, _query: AnyLayout, action: (docs: T[]) => void, regFinalizer: RefFinalizer): (query: AnyLayout) => void {
    let oldQuery = _query
    const q = query(_class, _query)
    let unsubscriber = q.subscribe(action)
    regFinalizer(() => {
      unsubscriber()
    })
    return (newQuery: AnyLayout) => {
      if (JSON.stringify(oldQuery) === JSON.stringify(newQuery)) {
        return
      }
      unsubscriber()
      const q = query(_class, newQuery)
      unsubscriber = q.subscribe(action)
      oldQuery = newQuery
    }
  }

  function generateId () {
    return genId() as Ref<Doc>
  }

  function processTx (tx: Tx): Promise<any> {
    console.log('processTx', tx)
    const networkComplete = coreProtocol.tx(tx)
    return Promise.all([
      networkComplete,
      txProcessor.process(txContext(TxContextSource.Client, networkComplete), tx)
    ])
  }

  function getUserId () {
    return platform.getMetadata(login.metadata.WhoAmI) as StringProperty
  }

  const ops = createOperations(model, processTx, getUserId)

  function loadDomain (domain: string): Promise<Doc[]> {
    return coreProtocol.loadDomain(domain)
  }

  return {
    getModel: () => model,
    loadDomain,
    query,
    subscribe,
    find,
    findOne,
    ...ops,
    generateId,
    tx: processTx,
    getUserId
  } as CoreService
}
