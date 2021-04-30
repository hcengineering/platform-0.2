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

import { AnyLayout, Class, DateProperty, Doc, generateId, Property, Ref, StringProperty } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_UPDATE_TX, CreateTx, DeleteTx, Space,
  TxOperation, UpdateTx
} from '@anticrm/domains'

export function newCreateTx<T extends Doc> (doc: T, _user: StringProperty, _objectSpace?: Ref<Space>): CreateTx {
  const {
    _id,
    _class,
    ...objValue
  } = doc

  // remove _space field if defined
  delete (objValue as any)._space

  return {
    _class: CORE_CLASS_CREATE_TX,
    _id: generateId(),
    _objectSpace,
    _date: Date.now() as DateProperty,
    _user,
    _objectId: _id ?? generateId(),
    _objectClass: _class,
    object: (objValue as unknown) as AnyLayout
  }
}

export function newUpdateTx (_class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[], _user: StringProperty, _objectSpace?: Ref<Space>): UpdateTx {
  return {
    _class: CORE_CLASS_UPDATE_TX,
    _id: generateId(),
    _objectId: _id,
    _objectClass: _class,
    _objectSpace,
    _date: Date.now() as Property<number, Date>,
    _user,
    operations
  }
}

export function newDeleteTx (_class: Ref<Class<Doc>>, _id: Ref<Doc>, _user: StringProperty, _objectSpace?: Ref<Space>): DeleteTx {
  return {
    _class: CORE_CLASS_DELETE_TX,
    _id: generateId(),
    _objectId: _id,
    _objectClass: _class,
    _objectSpace,
    _date: Date.now() as Property<number, Date>,
    _user
  }
}
