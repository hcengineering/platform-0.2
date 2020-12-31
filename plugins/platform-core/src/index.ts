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
import {
  Ref,
  Class,
  Doc,
  AnyLayout,
  Emb
} from '@anticrm/model'
import { CoreProtocol, VDoc } from '@anticrm/core'
import { ModelDb } from './modeldb'

export type Subscriber<T> = (value: T[]) => void
export type Unsubscriber = () => void

export interface QueryResult<T extends Doc> {
  subscribe (run: Subscriber<T>): Unsubscriber
}

export interface CoreService extends Service, CoreProtocol {
  getModel (): ModelDb
  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T>
  createDoc<T extends Doc> (doc: T): Promise<void>
  createVDoc<T extends VDoc> (vdoc: T): Promise<void>
  push (vdoc: VDoc, attribute: string, element: Emb): Promise<void>
  generateId (): Ref<Doc>
  getUserId (): string
}

export default plugin(
  'core' as Plugin<CoreService>,
  {},
  {
    metadata: {
      Model: '' as Metadata<{ [key: string]: Doc[] }>,
      Offline: '' as Metadata<boolean>,
      WSHost: '' as Metadata<string>,
      WSPort: '' as Metadata<string>,
      Token: '' as Metadata<string>
    }
  }
)
