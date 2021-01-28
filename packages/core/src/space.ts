import { Doc, Emb } from './classes'

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

  archived: boolean // If specified, channel is marked as archived, only owner could archive space
}
