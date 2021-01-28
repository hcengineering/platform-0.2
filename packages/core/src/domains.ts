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

import { Class, Classifier, DateProperty, Doc, Emb, Ref, StringProperty } from './classes'

// S P A C E

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

// V D O C

export interface Application extends Doc { }

export interface List extends Emb {
  id: string
  name: string
  application: Ref<Application>
}

export interface VDoc extends Doc {
  _space: Ref<Space>
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

// B A C K L I N K S

export interface Backlink {
  _backlinkClass: Ref<Class<Doc>>
  _backlinkId: Ref<Doc>
  pos: number
}

export interface Backlinks extends Doc {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  backlinks: Backlink[]
}

export const BACKLINKS_DOMAIN = 'backlinks'

// T I T L E

export const TITLE_DOMAIN = 'title'

export interface Title extends Doc {
  _objectClass: Ref<Classifier<Doc>>
  _objectId: Ref<Doc>
  title: string | number
}
