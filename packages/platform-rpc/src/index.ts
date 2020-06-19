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

import { plugin, Plugin, Service, Metadata } from '@anticrm/platform'

export type ReqId = string | number

export interface Request<P extends any[]> {
  id?: ReqId
  method: string
  params: P
}

export interface RpcError {
  code: number
  message?: string
  data?: any
}

export interface Response<R> {
  result?: R
  id?: ReqId
  error?: RpcError
}

export interface RpcService extends Service {
  request<P extends any[], R> (method: string, ...params: P): Promise<R>

  // find (_class: string, query: {}): Promise<[]>
  // load (domain: string): Promise<[]>
}

export default plugin('rpc' as Plugin<RpcService>, {}, {
  metadata: {
    WSHost: '' as Metadata<string>,
    WSPort: '' as Metadata<number>
  }
})
