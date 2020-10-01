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

import { AnyLayout, Class, CORE_CLASS_SPACE, Doc, Index, Ref, Space, Tx } from '@anticrm/core'
import { SpaceStorage } from './spaceStorage'

export class SecurityIndex implements Index {
  private storage: SpaceStorage
  private account: string

  constructor (account: string, store: SpaceStorage) {
    this.account = account
    this.storage = store
  }

  tx (tx: Tx): Promise<any> {
    // TODO: throw some kind of SecurityError if the account has no rights to execute the transaction
    return Promise.resolve()
  }

  /**
   * Filters the given query to satisfy current user account rights.
   * The result query can be used to request objects the user has access to from the storage.
   *
   * @param _class the object's class to request
   * @param query the query to filter
   * @returns true if the query satisfies user's rights and can be used to request objects from the storage, false otherwise
   */
  async filterQuery (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<boolean> {
    const userSpaces = await this.storage.getUserSpaces(this.account)
    const spaceKey = this.getSpaceKey(_class)

    // check filter by space in the request
    if (spaceKey in query) {
      const spaceInQuery = query[spaceKey] as Ref<Space>

      if (userSpaces.indexOf(spaceInQuery) < 0) {
        // the requested space is NOT in the list of available to the user
        return false
      }
      // else OK, use that filter to query
    } else {
      // no space filter provided, use all spaces available to the user
      query[spaceKey] = { $in: userSpaces }
    }

    return true
  }

  private getSpaceKey (_class: Ref<Class<Doc>>): string {
    // for Space objects use _id to filter available ones
    return _class === CORE_CLASS_SPACE ? '_id' : '_space'
  }
}
