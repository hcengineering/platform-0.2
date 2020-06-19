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
import { RpcService, Response } from '@anticrm/platform-rpc'
import { MemDb } from './memdb'
import { Ref, Class } from './types'
import rpcStub from '.'

/*!
  * Anticrm Platform™ Core Internationalization Plugin
  * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
  * Licensed under the Eclipse Public License, Version 2.0
  */
export default async (platform: Platform): Promise<RpcService> => {

  const metamodel = platform.getMetadata(rpcStub.metadata.Metamodel)
  if (!metamodel)
    throw new Error('metamodel required for rpc stub')

  const memdb = new MemDb()
  memdb.loadModel(metamodel)

  function find (_class: string, query: {}): Promise<[]> {
    return memdb.find(_class as Ref<Class>, query) as Promise<[]>
  }

  async function load (): Promise<[]> {
    return memdb.dump() as []
  }

  return {
    request<P extends any[], R> (method: string, ...params: P): Promise<R> {
      switch (method) {
        case 'load':
          return load() as unknown as Promise<R>
        case 'find':
          const _class = params[0] as string
          const query = params[1] as {}
          return find(_class, query) as unknown as Promise<R>
        case 'commit':
          const commit = params[0]
          console.log(commit)
          return Promise.resolve({}) as Promise<R>
        default:
          throw new Error('Unknown rpc method')
      }
    }
  }

}