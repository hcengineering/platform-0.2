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

import type { Platform } from '@anticrm/platform'
import {
  Ref, Class, Doc, AnyLayout, Domain, MODEL_DOMAIN, CoreProtocol, Tx,
  QueryResult, VDoc, Space, generateId, CreateTx, Property, PropertyType, ModelIndex
} from '@anticrm/core'
import { ModelDb } from './modeldb'

import core, { CoreService } from '.'
import login from '@anticrm/login'
import rpcService from './rpc'

import { TxProcessor, VDocIndex, TitleIndex, TextIndex, TxIndex } from '@anticrm/core'

import { Cache } from './cache'
import { Titles } from './titles'
import { Graph } from './graph'

/*!
 * Anticrm Platform™ Workbench Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const rpc = rpcService(platform)

  const coreProtocol: CoreProtocol = {
    find: (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> => rpc.request('find', _class, query),
    findOne: (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> => rpc.request('findOne', _class, query),
    tx: (tx: Tx): Promise<void> => rpc.request('tx', tx),
    loadDomain: (domain: string): Promise<Doc[]> => rpc.request('loadDomain', domain),
  }

  const model = new ModelDb()
  const cache = new Cache(coreProtocol)
  const titles = new Titles()
  const graph = new Graph()

  model.loadModel(await coreProtocol.loadDomain(MODEL_DOMAIN))

  const domains = new Map<string, Domain>()
  domains.set(MODEL_DOMAIN, model)

  const txProcessor = new TxProcessor([
    new TxIndex(cache),
    new VDocIndex(model, cache),
    new TitleIndex(model, titles),
    new TextIndex(model, graph),
    new ModelIndex(model, model)
  ])

  function find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    const domainName = model.getDomain(_class)
    const domain = domains.get(domainName)
    if (domain) {
      return domain.find(_class, query)
    }
    return cache.find(_class, query)
  }

  function query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    const domainName = model.getDomain(_class)
    const domain = domains.get(domainName)
    if (domain) {
      return domain.query(_class, query)
    }
    return cache.query(_class, query)
  }

  function createDoc<T extends Doc> (doc: Doc): Promise<void> {

    const tx: CreateTx = {
      _class: core.class.CreateTx,
      _id: generateId() as Ref<Doc>,
      _date: Date.now() as Property<number, Date>,
      _user: platform.getMetadata(login.metadata.WhoAmI) as Property<string, string>,
      object: doc
    }

    return coreProtocol.tx(tx)
  }

  return {
    getModel () { return model },
    query,
    find,
    createDoc
  }

}
