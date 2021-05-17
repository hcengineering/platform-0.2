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

import { Class, Mixin, Ref } from '@anticrm/core'
import { Component, identify } from '@anticrm/status'
import { CollectionReference } from './collection'
import { Indices } from './primary'
import { Reference, ShortID } from './references'
import { Application, Space, SpaceUser } from './space'
import { Title } from './title'
import { AddItemTx, CreateTx, DeleteTx, ItemTx, ObjectTx, RemoveItemTx, UpdateItemTx, UpdateTx } from './tx'
import { VDoc } from './vdoc'

export default identify('core' as Component, {
  class: {
    Application: '' as Ref<Class<Application>>,
    Reference: '' as Ref<Class<Reference>>,
    Space: '' as Ref<Class<Space>>,
    SpaceUser: '' as Ref<Class<SpaceUser>>,
    Title: '' as Ref<Class<Title>>,
    VDoc: '' as Ref<Class<VDoc>>,

    ObjectTx: '' as Ref<Class<ObjectTx>>,
    ItemTx: '' as Ref<Class<ItemTx>>,

    CreateTx: '' as Ref<Class<CreateTx>>,
    UpdateTx: '' as Ref<Class<UpdateTx>>,
    DeleteTx: '' as Ref<Class<DeleteTx>>,

    AddItemTx: '' as Ref<Class<AddItemTx>>,
    UpdateItemTx: '' as Ref<Class<UpdateItemTx>>,
    RemoveItemTx: '' as Ref<Class<RemoveItemTx>>
  },
  mixin: {
    Indices: '' as Ref<Mixin<Indices>>,
    ShortID: '' as Ref<Mixin<ShortID>>,
    CollectionReference: '' as Ref<Mixin<CollectionReference>>
  }
})

export * from './model_storage'
export * from './tx'
export * from './primary'
export * from './primary_utils'
export * from './references'
export * from './space'
export * from './title'
export * from './vdoc'
export * from './tx_utils'
export * from './collection'
