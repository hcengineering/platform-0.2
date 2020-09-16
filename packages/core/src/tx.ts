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

import { Property, Doc, StringProperty, Ref, Class, Classifier, PropertyType } from './core'

export type DateProperty = Property<number, Date>

export const TX_DOMAIN = 'tx'

export interface Space extends Doc {
  label: string
}

export interface VDoc extends Doc {
  _space: Ref<Space>
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

export interface Tx extends Doc {
  _date: DateProperty
  _user: StringProperty
  _objectId: Ref<VDoc>
  _objectClass: Ref<Class<VDoc>>
}

export interface CreateTx extends Tx {
  _space: Ref<Space>
  _attributes: { [key: string]: PropertyType }
}

export interface PushTx extends Tx {
  _attribute: StringProperty
  _attributes: { [key: string]: PropertyType }
}

export interface UpdateTx extends Tx {
  _attributes: { [key: string]: any }
}

export interface DeleteTx extends Tx {
}

export const CORE_CLASS_CREATETX = 'class:core.CreateTx' as Ref<Class<CreateTx>>
export const CORE_CLASS_PUSHTX = 'class:core.PushTx' as Ref<Class<PushTx>>
export const CORE_CLASS_UPDATETX = 'class:core.UpdateTx' as Ref<Class<UpdateTx>>
export const CORE_CLASS_DELETETX = 'class:core.DeleteTx' as Ref<Class<DeleteTx>>


