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

export interface Request {
  id: string | number | null
  meth: string
  params?: any[]
}

export interface RpcError {
  code: number
  message: string
  data?: any
}

export interface Response {
  id: string | number | null
  result?: any
  error?: RpcError
}

export function makeRequest (request: Request): string | Buffer {
  return JSON.stringify(request)
}

export function getRequest (req: string | Buffer): Request {
  return JSON.parse(req as string)
}

export function makeResponse (response: Response): string | Buffer {
  return JSON.stringify(response)
}

export function getResponse (res: string | Buffer): Response {
  return JSON.parse(res as string)
}
