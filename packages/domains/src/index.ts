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

import { AnyLayout, Class, Classifier, DateProperty, Doc, Emb, Mixin, Ref, StringProperty, Tx } from '@anticrm/core'

// TXes

export const CORE_CLASS_CREATE_TX = 'class:core.CreateTx' as Ref<Class<CreateTx>>
export const CORE_CLASS_UPDATE_TX = 'class:core.UpdateTx' as Ref<Class<UpdateTx>>
export const CORE_CLASS_DELETE_TX = 'class:core.DeleteTx' as Ref<Class<DeleteTx>>
export const CORE_CLASS_PUSH_TX = 'class:core.PushTx' as Ref<Class<PushTx>>

export const TX_DOMAIN = 'tx'

export interface ObjectTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
}

export interface CreateTx extends ObjectTx {
  object: AnyLayout
}

export interface PushTx extends ObjectTx {
  _attribute: StringProperty
  _attributes: AnyLayout
  _query?: AnyLayout
}

export interface UpdateTx extends ObjectTx {
  _attributes: AnyLayout
  _query?: AnyLayout
}

export interface DeleteTx extends ObjectTx {
  _query?: AnyLayout
}

// S P A C E

/**
 * Define a space user - association, it hold some extra properties.
 */
export interface SpaceUser extends Emb {
  userId: string // An user account id
  owner: boolean // Make user as space owner
}

export const CORE_CLASS_SPACE = 'class:core.Space' as Ref<Class<Space>>

/**
 * Define an application descriptor.
 */
export interface Application extends Doc {
}

export interface Space extends Doc {
  name: string // a space name
  description: string // a space optional description.

  application: Ref<Application> // An application space is belong to.
  applicationSettings?: Emb // Some custom application settings.

  spaceKey: string // A space shortId prefix.

  users: SpaceUser[] // A list of included user accounts, not all may be active.
  isPublic: boolean // If specified, a users are interpreted as include list.
  archived: boolean // If specified, channel is marked as archived, only owner could archive space
}

// V D O C

export interface List extends Emb {
  id: string
  name: string
  application: Ref<Application>
}

export const CORE_CLASS_VDOC = 'class:core.VDoc' as Ref<Class<VDoc>>

export interface VDoc extends Doc {
  _space: Ref<Space>
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

// R E F E R E N C E S

export const CORE_CLASS_REFERENCE = 'class:core.Reference' as Ref<Class<Reference>>
export const CORE_MIXIN_SHORTID = 'mixin:core.ShortID' as Ref<Mixin<ShortID>>

/**
 * A reference object from and source to any target
 *
 * source - define a source object with class and properties.
 * target - define a target object with class and properties.
 */
export interface Reference extends Doc {
  _sourceId?: Ref<Doc>
  _sourceClass: Ref<Class<Doc>>
  _sourceProps?: Record<string, unknown>

  _targetId?: Ref<Doc>
  _targetClass: Ref<Class<Doc>>
  _targetProps?: Record<string, unknown>
}

/**
 * Define a list of space references for this object, this is a mixin.
 */
export interface ShortID extends VDoc {
  /**
   * A useful short Id for this object.
   */
  shortId: string
}

export const REFERENCE_DOMAIN = 'references'

// T I T L E

export const TITLE_DOMAIN = 'title'
export const CORE_CLASS_TITLE = 'class:core.Title' as Ref<Class<Title>>

/**
 * Define a title source, ShortId titles will be used to reference documents with short form.
 */
export enum TitleSource {
  Title, ShortId
}

export interface Title extends Doc {
  _objectClass: Ref<Classifier<Doc>>
  _objectId: Ref<Doc>
  title: string | number
  source: TitleSource
}
