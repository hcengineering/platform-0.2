//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Space, SpaceUser } from '@anticrm/domains'
import { CoreService } from '@anticrm/platform-core'

/**
 * Check if current user is joined a proposed space.
 * @param currentUser - a current user id
 * @param space  - a space to check.
 */
export function getCurrentUserSpace (currentUser: string, space: Space): SpaceUser | null {
  for (const u of space.users) {
    if (u.userId === currentUser) {
      return u
    }
  }
  return null
}

export function getSpaceName (space: Space, withTitle = true): string {
  return (space.isPublic ? '#' : '$') + (withTitle ? space.name : '')
}

// Join public space
export function joinSpace (service: Promise<CoreService>, s: Space): void {
  service.then(cs => cs.updateWith(s, (b) =>
    b.users.push({
      userId: cs.getUserId(),
      owner: false
    })
  ))
}

// Leave public space
export function leaveSpace (service: Promise<CoreService>, s: Space): void {
  service.then(cs => cs.updateWith(s, (b) =>
    b.users.match({ userId: cs.getUserId() }).pull())
  )
}

export function archivedSpaceUpdate (service: Promise<CoreService>, s: Space, value: boolean): void {
  service.then(cs => cs.updateWith(s, (b) =>
    b.set({ archived: value }))
  )
}
