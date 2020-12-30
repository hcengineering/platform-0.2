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

import { AnyLayout, Class, Doc, Ref, Tx, StringProperty } from '@anticrm/model'
import core, { CreateTx, DeleteTx, PushTx, Space, SpaceUser, UpdateTx } from '@anticrm/core'
import { Client } from './server'
import { WorkspaceProtocol } from './workspace'

function getSpaceKey (_class: Ref<Class<Doc>>): string {
  // for Space objects use _id to filter available ones
  return _class === core.class.Space ? '_id' : '_space'
}
/**
   * Filters the given query to satisfy current user account rights.
   * The result query can be used to request objects the user has access to from the storage.
   */
export async function filterQuery (spaces: Map<string, SpaceUser>, _class: Ref<Class<Doc>>, query: AnyLayout): Promise<{ valid: boolean, filteredQuery: AnyLayout }> {
  const spaceKey = getSpaceKey(_class)

  // check filter by space in the request
  if (spaceKey in query) {
    const spaceInQuery = query[spaceKey] as Ref<Space>

    if (!spaces.has(spaceInQuery)) {
      // the requested space is NOT in the list of available to the user
      return { valid: false, filteredQuery: query }
    }
    // else OK, use that filter to query
  } else {
    // no space filter provided, use all spaces available to the user
    const userSpaces: StringProperty[] = []
    for (const k of spaces.keys()) {
      userSpaces.push(k as StringProperty)
    }
    userSpaces.push(null as unknown as StringProperty)
    query[spaceKey] = { $in: userSpaces }
  }

  return { valid: true, filteredQuery: query }
}

/**
 * Check for object are in user spaces and return true if so
 */
export function isAcceptable (spaces: Map<string, SpaceUser>, _class: Ref<Class<Doc>>, doc: AnyLayout): boolean {
  if (!doc) {
    return false
  }
  const spaceKey = getSpaceKey(_class)
  const spaceId = doc[spaceKey] as Ref<Space>
  if (spaceId) {
    return spaces.has(spaceId)
  }
  return true
}

function checkUpdateSpaces (spaces: Map<string, SpaceUser>, s: Space, spaceId: string, email: string) {
  const users = s.users || []
  let us = users.find(u => u.userId === email)
  if (s.isPublic && !us) {
    // Add in any case for public space
    us = ({ userId: email, owner: false } as SpaceUser)
  }
  if (us) {
    // Add space to us since it is now accessible
    spaces.set(spaceId, us)
  }
}

function getObjectById (workspace: WorkspaceProtocol, _class: Ref<Class<Doc>>, id: Ref<Doc>): Promise<Doc | undefined> {
  // TODO: Think about some cache
  return workspace.findOne(_class, { _id: id })
}

/**
 * Process transaction and update userSpaces in case of proper space operation.
 * Return true if opertaion is allowed by user.
 */
export async function processTx (workspace: WorkspaceProtocol, spaces: Map<string, SpaceUser>, tx: Tx, client: Client, ownChange: boolean): Promise<boolean> {
  switch (tx._class) {
    case core.class.CreateTx: {
      const createTx = tx as CreateTx
      if (createTx._objectClass === core.class.Space) {
        // Createion of a new space, we need to mark user as owner if this information is missing
        const s = (createTx.object as unknown) as Space
        if (ownChange) {
          const users = s.users || []
          const us = users.find(u => u.userId === client.email)
          if (!s.isPublic && (!us || !us.owner)) {
            // Do not allow space with us not owner.
            return Promise.reject(new Error('Space doesn\'t contain owner. Operation is not allowed'))
          }
        }
        checkUpdateSpaces(spaces, s, createTx._objectId, client.email)

        // It is not yet created, so Space object doesn't have _id specified.
        if (!spaces.has(createTx._objectId)) {
          return Promise.reject(new Error('Space doesn\'t contain owner. Operation is not allowed'))
        }
        return true
      }
      return isAcceptable(spaces, createTx._objectClass, createTx.object)
    }
    case core.class.UpdateTx: {
      const updateTx = tx as UpdateTx
      const obj = await getObjectById(workspace, updateTx._class, updateTx._objectId)

      // Check if space, we need update out list
      if (!ownChange && updateTx._objectClass === core.class.Space) {
        checkUpdateSpaces(spaces, (obj as unknown) as Space, updateTx._objectId, client.email)
      }
      return isAcceptable(spaces, updateTx._class, (obj as unknown) as AnyLayout)
    }
    case core.class.PushTx: {
      const pushTx = tx as PushTx
      const obj = await getObjectById(workspace, pushTx._objectClass, pushTx._objectId)
      if (!ownChange && pushTx._objectClass === core.class.Space) {
        // Check if SpaceUser is we, since operation is already applied, we could check with Space object itself.
        const sp = (obj as unknown) as Space
        checkUpdateSpaces(spaces, sp, sp._id, client.email)
      }
      return isAcceptable(spaces, pushTx._class, (obj as unknown) as AnyLayout)
    }
    case core.class.DeleteTx: {
      const delTx = tx as DeleteTx
      const obj = await getObjectById(workspace, delTx._objectClass, delTx._objectId)
      return isAcceptable(spaces, delTx._class, (obj as unknown) as AnyLayout)
    }
    default:
      throw new Error(`Bad transaction type '${tx._class}'`)
  }
}

export async function getUserSpaces (workspace: WorkspaceProtocol, email: string): Promise<Map<string, SpaceUser>> {
  const userSpaces = new Map<string, SpaceUser>()
  const allSpaces = await workspace.find(core.class.Space, {})
  for (const s of allSpaces) {
    let us = s.users.find(u => u.userId === email)
    if (s.isPublic) {
      // Add in any case for public space
      us = us || ({ userId: email, owner: false } as SpaceUser)
    }
    if (us) {
      userSpaces.set(s._id, us)
    }
  }
  return userSpaces
}
