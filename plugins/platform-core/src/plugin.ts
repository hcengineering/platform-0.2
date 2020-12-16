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
import {
  Ref,
  Class,
  Doc,
  AnyLayout,
  MODEL_DOMAIN,
  CoreProtocol,
  Tx,
  TITLE_DOMAIN,
  BACKLINKS_DOMAIN,
  Emb,
  VDoc,
  generateId as genId,
  ModelIndex,
  DateProperty,
  StringProperty,
  txContext,
  TxContextSource,
  TxProcessor,
  VDocIndex,
  TitleIndex,
  TextIndex,
  TxIndex
} from '@anticrm/core'
import { ModelDb } from './modeldb'

import { CoreService, QueryResult } from '.'
import login from '@anticrm/login'
import rpcService from './rpc'

import { QueriableStorage } from './queries'

import { Cache } from './cache'
import { Titles } from './titles'
import { Graph } from './graph'
import { newCreateTx, newPushTx } from './tx'

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const rpc = rpcService(platform)

  const coreProtocol: CoreProtocol = {
    find: <T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> => rpc.request('find', _class, query),
    findOne: <T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> => rpc.request('findOne', _class, query),
    tx: (tx: Tx): Promise<any> => rpc.request('tx', tx),
    loadDomain: (domain: string): Promise<Doc[]> => rpc.request('loadDomain', domain)
  }

  // Storages

  const model = new ModelDb()
  const titles = new Titles(model)
  const graph = new Graph()
  const cache = new Cache(coreProtocol)

  model.loadModel(await coreProtocol.loadDomain(MODEL_DOMAIN))

  coreProtocol.loadDomain(TITLE_DOMAIN).then(docs => {
    const ctx = txContext()
    for (const doc of docs) {
      titles.store(ctx, doc)
    }
  })

  coreProtocol.loadDomain(BACKLINKS_DOMAIN).then(docs => {
    const ctx = txContext()
    for (const doc of docs) {
      graph.store(ctx, doc)
    }
  })

  const qModel = new QueriableStorage(model, model)
  const qTitles = new QueriableStorage(model, titles)
  const qGraph = new QueriableStorage(model, graph)
  const qCache = new QueriableStorage(model, cache)

  // const queriables = [qModel, qTitles, qGraph, qCache]

  const domains = new Map<string, QueriableStorage>()
  domains.set(MODEL_DOMAIN, qModel)
  domains.set(TITLE_DOMAIN, qTitles)
  domains.set(BACKLINKS_DOMAIN, qGraph)

  const txProcessor = new TxProcessor([
    new TxIndex(qCache),
    new VDocIndex(model, qCache),
    new TitleIndex(model, qTitles),
    new TextIndex(model, qGraph),
    new ModelIndex(model, qModel)
  ])

  // add listener to process data updates from backend
  rpc.addEventListener(response => {
    // Do not process if result is not passed, it could be if sources is our transaction.
    if (response.result != null) {
      txProcessor.process(txContext(TxContextSource.Server), response.result as Tx)
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
    return find(_class, query).then(docs => (docs.length === 0 ? undefined : docs[0]))
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
    console.log('processTx', tx)
    const networkComplete = coreProtocol.tx(tx)
    return Promise.all([
      networkComplete,
      txProcessor.process(txContext(TxContextSource.Client, networkComplete), tx)
    ])
  }

  function createDoc<T extends Doc> (doc: T): Promise<any> {
    if (!doc._id) {
      doc._id = generateId()
    }

    return processTx(newCreateTx(doc, platform.getMetadata(login.metadata.WhoAmI) as StringProperty))
  }

  function createVDoc<T extends VDoc> (vdoc: T): Promise<void> {
    if (!vdoc._createdBy) {
      vdoc._createdBy = platform.getMetadata(login.metadata.WhoAmI) as StringProperty
    }
    if (!vdoc._createdOn) {
      vdoc._createdOn = Date.now() as DateProperty
    }
    return createDoc(vdoc)
  }

  function push (vdoc: VDoc, _attribute: string, element: Emb): Promise<any> {
    return processTx(
      newPushTx(vdoc, _attribute, element, platform.getMetadata(login.metadata.WhoAmI) as StringProperty)
    )
  }

  function loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]> {
    return coreProtocol.loadDomain(domain, index, direction)
  }

  return {
    getModel: () => model,
    loadDomain,
    query,
    find,
    findOne,
    createDoc,
    createVDoc,
    push,
    generateId,
    tx: processTx
  } as CoreService
}
