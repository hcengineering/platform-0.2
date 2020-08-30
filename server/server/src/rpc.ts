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

export function makeRequest<R extends any[]> (request: Request<R>): string {
  return JSON.stringify(request)
}

export function getRequest<R extends any[]> (req: string): Request<R> {
  return JSON.parse(req as string)
}

export function makeResponse<R> (response: Response<R>): string {
  return JSON.stringify(response)
}

export function getResponse<R> (res: string): Response<R> {
  return JSON.parse(res as string)
}
