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

  users: SpaceUser[] // A list of included user accounts, not all may be active.
  isPublic: boolean // If specified, a users are interpreted as include list.
  archived: boolean // If specified, channel is marked as archived, only owner could archive space
}
