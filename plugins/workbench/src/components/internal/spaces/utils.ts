import { Space } from '@anticrm/core'

/**
 * Check if current user is joined a proposed space.
 * @param currentUser - a current user id
 * @param space  - a space to check.
 */
export function isCurrentUserSpace (currentUser: string, space: Space): boolean {
  for (const u of space.users) {
    if (u.userId === currentUser) {
      return true
    }
  }
  return false
}
export function getSpaceName (space: Space, withTitle = true): string {
  return (space.isPublic ? '#' : '$') + (withTitle ? space.name : '')
}
