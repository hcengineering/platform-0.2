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

import { AnyLayout, Class, CORE_CLASS_SPACE, Doc, Ref, Space, Storage, Tx } from '@anticrm/core'
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

  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout, options?: AnyLayout): Promise<T|null> {
    return this.proxyStorage.findOne(_class, query, options)
  }

  /**
   * Gets Ids of spaces that the given user account has access to.
   *
   * @param userAccount the user account to get spaces for
   * @returns the list of space Ids
   */
  // TODO: implement cache for this method
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

  /**
   * Gets list of user accounts that have access to the given space.
   *
   * @param space the space Id to ge list of user account for
   * @returns the list of related user accounts
   */
  // TODO: implement cache for this method
  async getSpaceUsers (space: Ref<Space>): Promise<string[]> {
    const getOnlyUsersOption = { projection: { users: true }} as unknown as AnyLayout
    const doc = await this.findOne(CORE_CLASS_SPACE, { _id: space }, getOnlyUsersOption)
    return doc && doc.users ? doc.users : []
  }

  /**
   * Gets space Id of the given object.
   *
   * @param _class the object's class
   * @param _id the object's Id
   * @returns the space Id that the object belongs to
   */
  async getObjectSpace (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<Ref<Space>> {
    if (_class === CORE_CLASS_SPACE) {
      return _id as Ref<Space>
    }

    const getOnlySpaceOption = { projection: { _space: true }} as unknown as AnyLayout
    const doc = await this.findOne(_class, { _id }, getOnlySpaceOption)
    return doc ? (doc as any)._space : null
  }
}
