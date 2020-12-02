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

import { AnyLayout, Class, CoreProtocol, Doc, Storage, Ref } from '@anticrm/core'

export class Cache implements Storage {
  async store (doc: Doc): Promise<void> {
    console.log('cache store')
  }

  async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    console.log('cache push')
  }

  async update (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void> {
    console.log('cache update')
  }

  async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<void> {
    console.log('cache remove')
  }

  private coreProtocol: CoreProtocol

  constructor (coreProtocol: CoreProtocol) {
    this.coreProtocol = coreProtocol
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.coreProtocol.find(_class, query) as Promise<T[]>
  }
}
