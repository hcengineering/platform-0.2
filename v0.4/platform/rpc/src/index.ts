//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Status, StatusCode, identify, Component, PlatformError, Severity } from '@anticrm/status'

export type ReqId = string | number

export class Request<P extends any[]> {
  id?: ReqId
  method: string
  params: P

  constructor (method: string, ...params: P) {
    this.method = method
    this.params = params
  }
}

/**
 * Response object define a server response on transaction request.
 *
 * Also used to inform other clients about operations being performed by server.
 */
export interface Response<R> {
  result?: R
  id?: ReqId
  error?: Status
}

export function serialize (object: Request<any> | Response<any>): string {
  return JSON.stringify(object)
}

export function readResponse<D> (response: string): Response<D> {
  return JSON.parse(response)
}

export function readRequest<P extends any[]> (request: string): Request<P> {
  const result: Request<P> = JSON.parse(request)
  if (typeof result.method !== 'string')
    throw new PlatformError(new Status(Severity.ERROR, Code.BadRequest, {}))
  return result
}

export function fromStatus (status: Status, id?: ReqId): Response<any> {
  return { id, error: status }
}

export const Code = identify('rpc' as Component, {
  Unauthorized: '' as StatusCode,
  Forbidden: '' as StatusCode,
  BadRequest: '' as StatusCode,
  UnknownMethod: '' as StatusCode<{method: string}>
})
