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

import type { Emb, Enum, EnumLiteral, EnumOf } from '@anticrm/core'
import {
  ArrayOf, Attribute, BagOf, Class, Classifier, CORE_CLASS_ARRAY_OF, CORE_CLASS_BAG_OF, CORE_CLASS_CLASS,
  CORE_CLASS_DOC, CORE_CLASS_EMB, CORE_CLASS_ENUM_OF, CORE_CLASS_INSTANCE_OF, CORE_CLASS_REF_TO, CORE_CLASS_STRING,
  CORE_CLASS_TYPE, Doc, Indices, InstanceOf, Mixin, Obj, Ref, RefTo, Tx, Type
} from '@anticrm/core'
import type { CreateTx, DeleteTx, ObjectSelector, Reference, Space, TxOperation, UpdateTx } from '@anticrm/domains'
import {
  Application, CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_SPACE, CORE_CLASS_TX_OPERATION,
  CORE_CLASS_UPDATE_TX, CORE_MIXIN_SHORTID,
  ShortID, SpaceUser, Title, VDoc
} from '@anticrm/domains'

import { AnyPlugin, identify } from '@anticrm/platform'

import Builder from './builder'

const modelIds = identify('core' as AnyPlugin, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Emb: CORE_CLASS_EMB as Ref<Class<Emb>>,
    Doc: CORE_CLASS_DOC as Ref<Class<Doc>>,

    Classifier: '' as Ref<Class<Classifier>>,

    Attribute: '' as Ref<Class<Attribute>>,
    Class: CORE_CLASS_CLASS as Ref<Class<Class<Obj>>>,
    Mixin: '' as Ref<Class<Mixin<Obj>>>,

    EnumLiteral: '' as Ref<Class<EnumLiteral>>,
    Enum: '' as Ref<Class<Enum<any>>>,

    // Data types
    Type: CORE_CLASS_TYPE as Ref<Class<Type>>,
    String: CORE_CLASS_STRING as Ref<Class<Type>>,
    Number: '' as Ref<Class<Type>>,
    Boolean: '' as Ref<Class<Type>>,
    Date: '' as Ref<Class<Type>>,
    ArrayOf: CORE_CLASS_ARRAY_OF as Ref<Class<ArrayOf>>,
    RefTo: CORE_CLASS_REF_TO as Ref<Class<RefTo<Doc>>>,
    BagOf: CORE_CLASS_BAG_OF as Ref<Class<BagOf>>,
    InstanceOf: CORE_CLASS_INSTANCE_OF as Ref<Class<InstanceOf<Emb>>>,
    EnumOf: CORE_CLASS_ENUM_OF as Ref<Class<EnumOf<any>>>,

    Tx: '' as Ref<Class<Tx>>,
    CreateTx: CORE_CLASS_CREATE_TX as Ref<Class<CreateTx>>,
    UpdateTx: CORE_CLASS_UPDATE_TX as Ref<Class<UpdateTx>>,
    ObjectSelector: '' as Ref<Class<ObjectSelector>>,
    TxOperation: CORE_CLASS_TX_OPERATION as Ref<Class<TxOperation>>,
    DeleteTx: CORE_CLASS_DELETE_TX as Ref<Class<DeleteTx>>,

    Title: '' as Ref<Class<Title>>,

    VDoc: '' as Ref<Class<VDoc>>,

    Space: CORE_CLASS_SPACE as Ref<Class<Space>>,
    SpaceUser: '' as Ref<Class<SpaceUser>>,

    Reference: '' as Ref<Class<Reference>>,

    Application: '' as Ref<Class<Application>>
  },
  mixin: {
    Indices: '' as Ref<Mixin<Indices>>,
    ShortID: CORE_MIXIN_SHORTID as Ref<Mixin<ShortID>>
  }
})
export default modelIds

export { Builder }

export * from './utils'
export * from './dsl'
