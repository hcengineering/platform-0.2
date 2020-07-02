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

export { DbProtocol as CoreProtocol } from '@anticrm/memdb'
export { CommitInfo } from '@anticrm/memdb'

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

export function makeDataResponse<R> (result: R, id?: ReqId): string {
  const response: Response<R> = {
    result,
    id
  }
  return JSON.stringify(response)
}

export function makeErrorResponse (code: number, id?: ReqId, message?: string, data?: any): string {
  const response: Response<void> = {
    id,
    error: {
      code,
      message,
      data
    },
  }
  return JSON.stringify(response)
}

export function getResponse<D> (response: string): Response<D> {
  return JSON.parse(response as string)
}

export function getRequest<P> (request: string): Request<P> {
  return JSON.parse(request)
}
