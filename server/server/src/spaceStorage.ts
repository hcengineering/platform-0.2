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

import { AnyLayout, Class, Doc, Ref, Storage } from '@anticrm/core'

export class SpaceStorage implements Storage {
  private proxyStorage: Storage

  constructor (store: Storage) {
    this.proxyStorage = store
  }

  store (doc: Doc): Promise<void> {
    return this.proxyStorage.store(doc)
  }

  push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    return this.proxyStorage.push(_class, _id, attribute, attributes)
  }

  update (_class: Ref<Class<Doc>>, selector: object, attributes: any): Promise<void> {
    return this.proxyStorage.update(_class, selector, attributes)
  }

  remove (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    return this.proxyStorage.remove(_class, _id)
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.proxyStorage.find(_class, query)
  }
}
