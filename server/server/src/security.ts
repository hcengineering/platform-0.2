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

import { AnyLayout, Class, CORE_CLASS_CREATETX, CORE_CLASS_DELETETX, CORE_CLASS_PUSHTX, CORE_CLASS_SPACE,
  CORE_CLASS_UPDATETX, CreateTx, Doc, Index, PushTx, Ref, Space, Tx, UpdateTx } from '@anticrm/core'
import { SpaceStorage } from './spaceStorage'

export class SecurityIndex implements Index {
  private storage: SpaceStorage
  private account: string

  constructor (account: string, storage: SpaceStorage) {
    this.account = account
    this.storage = storage
  }

  async tx (tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        return this.checkRightsToCreate((tx as CreateTx).object)
      case CORE_CLASS_UPDATETX:
        const updateTx = tx as UpdateTx
        return this.checkRightsToModify(updateTx._objectClass, updateTx._objectId)
      case CORE_CLASS_PUSHTX:
        const pushTx = tx as PushTx
        return this.checkRightsToModify(pushTx._objectClass, pushTx._objectId)
      case CORE_CLASS_DELETETX:
        // TODO
        return
      default:
        throw new Error(`Bad transaction type '${tx._class}'`)
    }
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
    const userSpaces = await this.getUserSpaces()
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

  private async getUserSpaces () {
    return this.storage.getUserSpaces(this.account)
  }

  private async getObjectSpace (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<Ref<Space>> {
    return this.storage.getObjectSpace(_class, _id)
  }

  private async checkRightsToModify (_class: Ref<Class<Doc>>, _id: Ref<Doc>) {
    const objectSpace = await this.getObjectSpace(_class, _id)

    if (objectSpace && (await this.getUserSpaces()).indexOf(objectSpace) < 0) {
      throw new Error(`The account '${this.account}' does not have access to the space '${objectSpace}' where it wanted to modify the object '${_id}'`)
    }
  }

  private async checkRightsToCreate (object: Doc) {
    const spaceKey = this.getSpaceKey(object._class)

    if (spaceKey in object) {
      let objectSpace = (object as any)[spaceKey]

      if (object._class !== CORE_CLASS_SPACE && objectSpace && (await this.getUserSpaces()).indexOf(objectSpace) < 0) {
        throw new Error(`The account '${this.account}' does not have access to the space '${objectSpace}' where it wanted to create the object '${object._id}'`)
      }
    }
    // else no space provided, all accounts will have access to the created object
  }
}
