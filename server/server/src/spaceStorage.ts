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

import { AnyLayout, Class, CORE_CLASS_SPACE, Doc, Ref, Space, Storage } from '@anticrm/core'
import { MongoStorage } from './mongo'

export class SpaceStorage implements Storage {
  private proxyStorage: MongoStorage

  constructor (store: MongoStorage) {
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

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout, options?: AnyLayout): Promise<T[]> {
    return this.proxyStorage.find(_class, query, options)
  }

  findInDomain<T extends Doc> (domain: string, query: AnyLayout, options?: AnyLayout): Promise<T[]> {
    return this.proxyStorage.findInDomain(domain, query, options)
  }

  /**
   * Gets spaces of the given user account.
   *
   * @param userAccount the user account to get spaces for
   */
  async getUserSpaces (userAccount: string): Promise<Ref<Space>[]> {
    if (!userAccount || userAccount.length == 0) {
      return []
    }

    const usersQuery = { users: { $elemMatch: { $eq: userAccount }}} as unknown as AnyLayout
    const getOnlyIdsOption = { projection: { _id: true }} as unknown as AnyLayout
    const spaces: Space[] = await this.find(CORE_CLASS_SPACE, usersQuery, getOnlyIdsOption)

    // pass null and undefined here to obtain documents not assigned to any space
    // TODO: remove 'General' and 'Random' when implement public spaces concept
    let userSpaceIds = [
      null as unknown as Ref<Space>,
      undefined as unknown as Ref<Space>,
      'space:workbench.General' as Ref<Space>,
      'space:workbench.Random' as Ref<Space>
    ]

    for (const space of spaces) {
      userSpaceIds.push(space._id as Ref<Space>)
    }

    return userSpaceIds
  }
}
