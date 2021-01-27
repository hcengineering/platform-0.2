import { Space, SpaceUser } from '@anticrm/core'
import { CoreService } from '@anticrm/platform-core'
import { Property, StringProperty } from '@anticrm/model'

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
export function joinSpace (service: CoreService, s: Space) {
  service.push(s, null, 'users' as StringProperty, {
    userId: service.getUserId() as StringProperty,
    owner: false as Property<boolean, boolean>
  })
}

// Leave public space
export function leaveSpace (service: CoreService, s: Space) {
  service.remove(s, {
    users: {
      userId: service.getUserId() as StringProperty
    }
  })
}

export function archivedSpaceUpdate (service: CoreService, s: Space, value: boolean) {
  service.update(s, null, {
    archived: value as Property<boolean, boolean>
  })
}
