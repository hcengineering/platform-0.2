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

import {
  AnyLayout,
  Class,
  CoreProtocol,
  CreateTx,
  PushTx,
  UpdateTx,
  DeleteTx,
  Doc,
  Emb,
  Metadata,
  Obj,
  VDoc,
  Plugin,
  plugin,
  Ref,
  Service,
  Type,
  Space,
  Title
} from '@anticrm/platform'
import { ModelDb } from './modeldb'
import { Graph } from './graph'

// P L U G I N

export interface CoreService extends Service, CoreProtocol {
  getModel (): ModelDb
  getGraph (): Graph
  generateId (): Ref<Doc>
  query (_class: Ref<Class<Doc>>, query: AnyLayout, listener: (result: Doc[]) => void): () => void
  createVDoc<T extends VDoc> (_class: Ref<Class<T>>, _attributes: Omit<T, keyof VDoc>, _id?: Ref<T>): Promise<void>
}

export default plugin('core' as Plugin<CoreService>, {}, {
  metadata: {
    Model: '' as Metadata<{ [key: string]: Doc[] }>,
    Offline: '' as Metadata<boolean>,
    WSHost: '' as Metadata<string>,
    WSPort: '' as Metadata<string>,
    Token: '' as Metadata<string>
  },
  class: {
    Class: '' as Ref<Class<Class<Obj>>>,
    CreateTx: '' as Ref<Class<CreateTx>>,
    PushTx: '' as Ref<Class<PushTx>>,
    UpdateTx: '' as Ref<Class<UpdateTx>>,
    DeleteTx: '' as Ref<Class<DeleteTx>>,
    Space: '' as Ref<Class<Space>>,
    Title: '' as Ref<Class<Title>>,
  }
})
