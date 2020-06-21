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

import { Ref, Class, Doc, Layout, DocLayout } from '@anticrm/platform'

// P R O T O C O L

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

export function makeRequest<P extends any[]> (request: Request<P>): string {
  return JSON.stringify(request)
}

export function getResponse<D> (res: string): Response<D> {
  return JSON.parse(res as string)
}

// C O R E  P R O T O C O L

export interface CommitInfo {
  created: DocLayout[]
}

export interface CoreProtocol {
  find (_class: Ref<Class<Doc>>, query: Layout): Promise<DocLayout[]>
  load (): Promise<DocLayout[]> // TODO: must be load domain
  commit (commitInfo: CommitInfo): Promise<void>
}

