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

import { Class, Doc, DocumentQuery, Ref, StringProperty, Tx } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_OBJECT_TX, CORE_CLASS_REFERENCE, CORE_CLASS_SPACE,
  CORE_CLASS_SPACE_USER,
  CORE_CLASS_TITLE, CORE_CLASS_TX, CORE_CLASS_UPDATE_TX, CreateTx, DeleteTx, Space, SpaceUser, UpdateTx
} from '@anticrm/domains'
import { Client } from './server'
import { WorkspaceProtocol } from './workspace'

export interface SpaceCheckResult {
  allowed: boolean
  sendSpace: Space | undefined
}

export interface SecurityContext {
  docs?: Doc[] // A list of touched documents.
}

export interface UserInfo extends SpaceUser {
  joined: boolean
}

function getSpaceKey (_class: Ref<Class<Doc>>): string {
  // for Space objects use _id to filter available ones
  switch (_class) {
    case CORE_CLASS_SPACE:
      return '_id'
    case CORE_CLASS_TX:
    case CORE_CLASS_OBJECT_TX:
    case CORE_CLASS_CREATE_TX:
    case CORE_CLASS_UPDATE_TX:
    case CORE_CLASS_DELETE_TX:
      return '_objectSpace'
    default:
      return '_space'
  }
}

/**
 * Filters the given query to satisfy current user account rights.
 * The result query can be used to request objects the user has access to from the storage.
 */
export function filterQuery (spaces: Map<string, UserInfo>, _class: Ref<Class<Doc>>, query: DocumentQuery<any>): { valid: boolean, filteredQuery: DocumentQuery<any> } {
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
    for (const k of spaces.entries()) {
      // Skip non joined spaces if query is not for SPACE
      if (k[1].joined || _class === CORE_CLASS_SPACE) {
        userSpaces.push(k[0] as StringProperty)
      }
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
export function isAcceptable (spaces: Map<string, UserInfo>, doc?: Doc): boolean {
  if (doc === undefined) {
    return false
  }
  const spaceKey = getSpaceKey(doc._class)
  const spaceId = (doc as any)[spaceKey] as Ref<Space>

  if (spaceId !== undefined) {
    return spaces.has(spaceId)
  }
  return true
}

/**
 * Check and update current user set of spaces, and return information if spaceId is added to list of user spaces.
 */
function checkUpdateSpaces (spaces: Map<string, UserInfo>, s: Space, email: string): Space | undefined {
  const users = s.users ?? []
  let us = users.find(u => u.userId === email)
  const joined = us !== undefined
  if (s.isPublic && (us === undefined)) {
    // Add in any case for public space
    us = {
      _class: CORE_CLASS_SPACE_USER,
      userId: email,
      owner: false
    }
  }
  if (us !== undefined) {
    // Add space to us since it is now accessible
    spaces.set(s._id, { ...us, joined })
    return s
  }
  // Check if spaces had this space, we need to remove it
  if (spaces.has(s._id)) {
    spaces.delete(s._id)
    return s
  }
  return undefined
}

async function getSpaceById (ctx: SecurityContext, workspace: WorkspaceProtocol, id: Ref<Space>): Promise<Space | undefined> {
  if (ctx.docs !== undefined) {
    for (const d of ctx.docs) {
      if (d._id === id) {
        return await Promise.resolve(d as Space)
      }
    }
  }
  const result = await workspace.findOne<Space>(CORE_CLASS_SPACE, { _id: id })
  if (result !== undefined) {
    if (ctx.docs === undefined) {
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
export async function processTx (ctx: SecurityContext, workspace: WorkspaceProtocol, spaces: Map<string, UserInfo>, tx: Tx, client: Client, ownChange: boolean): Promise<SpaceCheckResult> {
  const model = await workspace.getModel()

  switch (tx._class) {
    case CORE_CLASS_CREATE_TX: {
      const createTx = tx as CreateTx
      if (createTx._objectClass === CORE_CLASS_SPACE) {
        // Creation of a new space, we need to mark user as owner if this information is missing
        const s = model.createDocument<Space>(createTx._objectClass as Ref<Class<Space>>, (createTx.object as unknown) as Space, createTx._objectId as Ref<Space>)
        if (ownChange) {
          const users = s.users ?? []
          const us = users.find(u => u.userId === client.email)
          if (!s.isPublic && ((us === undefined) || !us.owner)) {
            // Do not allow space with us not owner.
            return Promise.reject(new Error('Space doesn\'t contain owner. Operation is not allowed'))
          }
        }
        const sendSpace = checkUpdateSpaces(spaces, s, client.email)

        // It is not yet created, so Space object doesn't have _id specified.
        if (ownChange) {
          if (!spaces.has(createTx._objectId)) {
            return Promise.reject(new Error('Space doesn\'t contain owner. Operation is not allowed'))
          }
          return {
            allowed: true,
            sendSpace
          }
        }
      }
      return {
        allowed: createTx._objectSpace !== undefined && spaces.has(createTx._objectSpace), // We do not allow to create objects without spaces now.
        sendSpace: undefined
      }
    }
    case CORE_CLASS_UPDATE_TX: {
      const updateTx = tx as UpdateTx
      let sendSpace: Space | undefined
      // Check if space, we need update out list
      if (updateTx._objectClass === CORE_CLASS_SPACE) {
        let obj = await getSpaceById(ctx, workspace, updateTx._objectId as Ref<Space>)
        if (obj !== undefined) {
          obj = model.updateDocument<Space>(obj, updateTx.operations)
          sendSpace = await checkUpdateSpaces(spaces, obj, client.email)
        }
      }
      return {
        allowed: updateTx._objectSpace !== undefined && spaces.has(updateTx._objectSpace),
        sendSpace
      }
    }
    case CORE_CLASS_DELETE_TX: {
      const delTx = tx as DeleteTx
      return {
        allowed: delTx._objectSpace !== undefined && spaces.has(delTx._objectSpace),
        sendSpace: undefined
      }
    }
    default:
      throw new Error(`Bad transaction type '${tx._class}'`)
  }
}

export async function getUserSpaces (workspace: WorkspaceProtocol, email: string): Promise<Map<string, UserInfo>> {
  const userSpaces = new Map<string, UserInfo>()
  const allSpaces = await workspace.find(CORE_CLASS_SPACE, {})
  for (const s of allSpaces) {
    let us = s.users.find(u => u.userId === email)
    const joined = us !== undefined

    if (s.isPublic) {
      // Add in any case for public space
      if (us === undefined) {
        us = {
          _class: CORE_CLASS_SPACE_USER,
          userId: email,
          owner: false
        }
      }
    }
    if (us !== undefined) {
      userSpaces.set(s._id, { ...us, joined })
    }
  }
  return userSpaces
}
