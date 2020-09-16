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

import { Status, Severity } from '@anticrm/platform'

export type ReqId = string | number

export class Request<P extends any[]> {
  id?: ReqId
  method: string
  params: P

  constructor(method: string, ...params: P) {
    this.method = method
    this.params = params
  }
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

export function serialize (object: Request<any> | Response<any>): string {
  return JSON.stringify(object)
}

export function readResponse<D> (response: string): Response<D> {
  return JSON.parse(response)
}

export function readRequest<P extends any[]> (request: string): Request<P> {
  return JSON.parse(request)
}

export function toStatus (response: Response<any>): Status {
  return new Status(Severity.ERROR, response.error?.code as number, response.error?.message as string)
}
