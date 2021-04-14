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

import core from './index'

import { CoreService, QueryResult } from '.'
import rpcService, { EventType } from './rpc'

import { QueriableStorage } from './queries'

import { Cache } from './cache'
import {
  AnyLayout, Class, CoreProtocol, Doc, generateId as genId, MODEL_DOMAIN, Ref, StringProperty, Tx, txContext,
  TxContextSource, TxProcessor
} from '@anticrm/core'
import { CORE_CLASS_REFERENCE, CORE_CLASS_SPACE, CORE_CLASS_TITLE, Space, TITLE_DOMAIN, VDoc } from '@anticrm/domains'

import { createOperations } from './operations'

import { ModelIndex } from '@anticrm/domains/src/indices/model'
import { VDocIndex } from '@anticrm/domains/src/indices/vdoc'
import { TxIndex } from '@anticrm/domains/src/indices/tx'
import { RPC_CALL_FIND, RPC_CALL_FINDONE, RPC_CALL_GEN_REF_ID, RPC_CALL_LOAD_DOMAIN, RPC_CALL_TX } from '@anticrm/rpc'
import { PassthroughsIndex } from '@anticrm/domains/src/indices/filter'

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const rpc = rpcService(platform)
  const model = new ModelDb()

  const coreProtocol: CoreProtocol = {
    async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
      const result = (await rpc.request(RPC_CALL_FIND, _class, query)) as T[]
      return result.map((it) => model.as(it, _class))
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
      const result = (await rpc.request(RPC_CALL_FINDONE, _class, query)) as (T | undefined)
      if (result) {
        return model.as(result, _class)
      }
      return result
    },
    tx (tx: Tx): Promise<any> {
      return rpc.request(RPC_CALL_TX, tx)
    },
    loadDomain (domain: string): Promise<Doc[]> {
      return rpc.request(RPC_CALL_LOAD_DOMAIN, domain)
    },
    genRefId (_space: Ref<Space>) {
      return rpc.request(RPC_CALL_GEN_REF_ID, _space)
    }
  }

  // Storages
  const cache = new Cache(coreProtocol)

  const modelDomain = await coreProtocol.loadDomain(MODEL_DOMAIN)
  model.loadModel(modelDomain)

  const qModel = new QueriableStorage(model, model)
  const qTitles = new QueriableStorage(model, cache)
  const qCache = new QueriableStorage(model, cache, true)

  // const queriables = [qModel, qTitles, qGraph, qCache]

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

  function generateId () {
    return genId() as Ref<Doc>
  }

  function processTx (tx: Tx): Promise<any> {
    const networkComplete = coreProtocol.tx(tx)
    return Promise.all([
      networkComplete,
      txProcessor.process(txContext(TxContextSource.Client, networkComplete), tx)
    ])
  }

  function getUserId () {
    return platform.getMetadata(core.metadata.WhoAmI) as StringProperty
  }

  const ops = createOperations(model, processTx, getUserId)

  function loadDomain (domain: string): Promise<Doc[]> {
    return coreProtocol.loadDomain(domain)
  }

  function genRefId (_space: Ref<Space>): Promise<Ref<VDoc>> {
    return coreProtocol.genRefId(_space)
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
  } as CoreService
}
