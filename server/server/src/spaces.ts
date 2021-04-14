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

import { AnyLayout, Class, Doc, Ref, StringProperty, Tx } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_REFERENCE, CORE_CLASS_SPACE,
  CORE_CLASS_TITLE, CORE_CLASS_UPDATE_TX, CreateTx, DeleteTx, Space, SpaceUser, UpdateTx
} from '@anticrm/domains'
import { Client } from './server'
import { WorkspaceProtocol } from './workspace'

export interface SpaceCheckResult {
  allowed: boolean,
  sendSpace: Space | null
}

export interface SecurityContext {
  docs?: Doc[] // A list of touched documents.
}

function getSpaceKey (_class: Ref<Class<Doc>>): string {
  // for Space objects use _id to filter available ones
  return _class === CORE_CLASS_SPACE ? '_id' : '_space'
}

/**
 * Filters the given query to satisfy current user account rights.
 * The result query can be used to request objects the user has access to from the storage.
 */
export function filterQuery (spaces: Map<string, SpaceUser>, _class: Ref<Class<Doc>>, query: AnyLayout): { valid: boolean, filteredQuery: AnyLayout } {
  if (_class === CORE_CLASS_TITLE || _class === CORE_CLASS_REFERENCE) {
    // Allow to proceed with title and references
    return {
      valid: true,
      filteredQuery: query
    }
  }
  const spaceKey = getSpaceKey(_class)

  // check filter by space in the request
  if (spaceKey in query) {
    const spaceInQuery = query[spaceKey] as Ref<Space>

    if (!spaces.has(spaceInQuery)) {
      // the requested space is NOT in the list of available to the user
      return {
        valid: false,
        filteredQuery: query
      }
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

  return {
    valid: true,
    filteredQuery: query
  }
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

/**
 * Check and update current user set of spaces, and return information if spaceId is added to list of user spaces.
 */
function checkUpdateSpaces (spaces: Map<string, SpaceUser>, s: Space, spaceId: string, email: string): Space | null {
  const users = s.users || []
  let us = users.find(u => u.userId === email)
  if (s.isPublic && !us) {
    // Add in any case for public space
    us = ({
      userId: email,
      owner: false
    } as SpaceUser)
  }
  if (us) {
    // Add space to us since it is now accessible
    spaces.set(spaceId, us)
    return s
  }
  // Check if spaces had this space, we need to remove it
  if (spaces.has(spaceId)) {
    spaces.delete(spaceId)
    return s
  }
  return null
}

async function getObjectById (ctx: SecurityContext, workspace: WorkspaceProtocol, _class: Ref<Class<Doc>>, id: Ref<Doc>): Promise<Doc | undefined> {
  if (ctx.docs) {
    for (const d of ctx.docs) {
      if (d._id === id) {
        return Promise.resolve(d)
      }
    }
  }
  const result = await workspace.findOne(_class, { _id: id })
  if (result) {
    if (!ctx.docs) {
      ctx.docs = []
    }
    ctx.docs.push(result)
  }
  return result
}

/**
 * Process transaction and update userSpaces in case of proper space operation.
 * Return true if operation is allowed by user.
 */
export async function processTx (ctx: SecurityContext, workspace: WorkspaceProtocol, spaces: Map<string, SpaceUser>, tx: Tx, client: Client, ownChange: boolean): Promise<SpaceCheckResult> {
  switch (tx._class) {
    case CORE_CLASS_CREATE_TX: {
      const createTx = tx as CreateTx
      if (createTx._objectClass === CORE_CLASS_SPACE) {
        // Creation of a new space, we need to mark user as owner if this information is missing
        const s = (createTx.object as unknown) as Space
        if (ownChange) {
          const users = s.users || []
          const us = users.find(u => u.userId === client.email)
          if (!s.isPublic && (!us || !us.owner)) {
            // Do not allow space with us not owner.
            return Promise.reject(new Error('Space doesn\'t contain owner. Operation is not allowed'))
          }
        }
        const sendSpace = checkUpdateSpaces(spaces, s, createTx._objectId, client.email)

        // It is not yet created, so Space object doesn't have _id specified.
        if (!spaces.has(createTx._objectId)) {
          return Promise.reject(new Error('Space doesn\'t contain owner. Operation is not allowed'))
        }
        return {
          allowed: true,
          sendSpace
        }
      }
      return {
        allowed: isAcceptable(spaces, createTx._objectClass, createTx.object),
        sendSpace: null
      }
    }
    case CORE_CLASS_UPDATE_TX: {
      const updateTx = tx as UpdateTx
      const obj = await getObjectById(ctx, workspace, updateTx._objectClass, updateTx._objectId)

      if (!obj) {
        throw new Error(`Document for update ${updateTx._objectClass} ${updateTx._objectId} is not found'`)
      }
      // Check if space, we need update out list
      let sendSpace: Space | null = null
      if (!ownChange && updateTx._objectClass === CORE_CLASS_SPACE) {
        sendSpace = checkUpdateSpaces(spaces, (obj as unknown) as Space, updateTx._objectId, client.email)
      }
      return {
        allowed: isAcceptable(spaces, updateTx._objectClass, (obj as unknown) as AnyLayout),
        sendSpace
      }
    }
    case CORE_CLASS_DELETE_TX: {
      const delTx = tx as DeleteTx
      const obj = await getObjectById(ctx, workspace, delTx._objectClass, delTx._objectId)
      if (!obj) {
        throw new Error(`Document for delete ${delTx._objectClass} ${delTx._objectId} is not found'`)
      }
      let sendSpace: Space | null = null
      if (!ownChange && delTx._objectClass === CORE_CLASS_SPACE) {
        // Check if SpaceUser is we, since operation is already applied, we could check with Space object itself.
        const sp = (obj as unknown) as Space
        sendSpace = checkUpdateSpaces(spaces, sp, sp._id, client.email)
      }
      return {
        allowed: isAcceptable(spaces, delTx._class, (obj as unknown) as AnyLayout),
        sendSpace
      }
    }
    default:
      throw new Error(`Bad transaction type '${tx._class}'`)
  }
}

export async function getUserSpaces (workspace: WorkspaceProtocol, email: string): Promise<Map<string, SpaceUser>> {
  const userSpaces = new Map<string, SpaceUser>()
  const allSpaces = await workspace.find(CORE_CLASS_SPACE, {})
  for (const s of allSpaces) {
    let us = s.users.find(u => u.userId === email)
    if (s.isPublic) {
      // Add in any case for public space
      us = us || ({
        userId: email,
        owner: false
      } as SpaceUser)
    }
    if (us) {
      userSpaces.set(s._id, us)
    }
  }
  return userSpaces
}
