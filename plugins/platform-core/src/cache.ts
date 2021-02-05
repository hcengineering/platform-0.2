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

import { CoreProtocol, TxContext, Storage, AnyLayout, Class, Doc, Ref, StringProperty } from '@anticrm/core'

export class Cache implements Storage {
  async store (tx: TxContext, doc: Doc): Promise<void> {  // eslint-disable-line
  }

  async push (tx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void> { // eslint-disable-line
  }

  async update (tx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null, attributes: AnyLayout): Promise<void> { // eslint-disable-line
  }

  async remove (tx: TxContext, _class: Ref<Class<Doc>>, doc: Ref<Doc>, _query: AnyLayout | null): Promise<void> { // eslint-disable-line
  }

  private coreProtocol: CoreProtocol

  constructor (coreProtocol: CoreProtocol) {
    this.coreProtocol = coreProtocol
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.coreProtocol.find(_class, query) as Promise<T[]>
  }

  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
    return this.coreProtocol.findOne(_class, query) as Promise<T | undefined>
  }
}
