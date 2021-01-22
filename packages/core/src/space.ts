import { Doc, Emb } from '@anticrm/model'

/**
 * Define a space user - association, it hold some extra properties.
 */
export interface SpaceUser extends Emb {
  userId: string // An user account id
  owner: boolean // Make user as space owner
}

export interface Space extends Doc {
  name: string // a space name
  description: string // a space optional description.

  users: SpaceUser[] // A list of included user accounts, not all coult be active.

  isPublic: boolean // If specified, a users are interpreted as include list.
  autoJoin: boolean // If specified, any new user will join proposed space.
}
