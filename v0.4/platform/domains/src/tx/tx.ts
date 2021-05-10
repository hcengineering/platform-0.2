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

import { AnyLayout, Class, Doc, generateId, Ref } from '@anticrm/core'
import domains, { CreateTx, DeleteTx, Space, TxOperation, UpdateTx } from '../'

export function newCreateTx<T extends Doc> (doc: T, _user: string, _objectSpace?: Ref<Space>): CreateTx {
  const {
    _id,
    _class,
    ...objValue
  } = doc

  // remove _space field if defined
  delete (objValue as any)._space

  return {
    _class: domains.class.CreateTx,
    _id: generateId(),
    _objectSpace,
    _date: Date.now(),
    _user,
    _objectId: _id ?? generateId(),
    _objectClass: _class,
    object: (objValue as unknown) as AnyLayout
  }
}

export function newUpdateTx (_objectClass: Ref<Class<Doc>>, _objectId: Ref<Doc>, operations: TxOperation[], _user: string, _objectSpace?: Ref<Space>): UpdateTx {
  return {
    _class: domains.class.UpdateTx,
    _id: generateId(),
    _objectId,
    _objectClass,
    _objectSpace,
    _date: Date.now(),
    _user,
    operations
  }
}

export function newDeleteTx (_objectClass: Ref<Class<Doc>>, _objectId: Ref<Doc>, _user: string, _objectSpace?: Ref<Space>): DeleteTx {
  return {
    _class: domains.class.DeleteTx,
    _id: generateId(),
    _objectId,
    _objectClass,
    _objectSpace,
    _date: Date.now(),
    _user
  }
}
