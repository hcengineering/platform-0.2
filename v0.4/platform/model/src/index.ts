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

import {
  ArrayOf, Attribute,
  BagOf, Class, Classifier,
  CORE_CLASS_ARRAY_OF, CORE_CLASS_BAG_OF, CORE_CLASS_CLASS,
  CORE_CLASS_DOC, CORE_CLASS_EMB, CORE_CLASS_ENUM_OF, CORE_CLASS_INSTANCE_OF,
  CORE_CLASS_MIXIN, CORE_CLASS_REF_TO,
  CORE_CLASS_STRING,
  CORE_CLASS_TYPE, Doc, Emb, Enum,
  EnumKey, EnumLiteral, EnumOf,
  InstanceOf, Mixin,
  Obj, Ref, RefTo,
  Type, Tx
} from '@anticrm/core'
import {
  Application, CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX,
  CORE_CLASS_OBJECTTX_DETAILS, CORE_CLASS_OBJECT_SELECTOR, CORE_CLASS_OBJECT_TX,
  CORE_CLASS_SPACE,
  CORE_CLASS_SPACE_USER, CORE_CLASS_TX_OPERATION,
  CORE_CLASS_UPDATE_TX, CORE_MIXIN_SHORTID,
  CreateTx, DeleteTx, ObjectSelector, ObjectTx, ObjectTxDetails, ShortID, Space, SpaceUser, TxOperation,
  UpdateTx, VDoc, Title, Reference, Indices
} from '@anticrm/domains'
import { Component, identify } from '@anticrm/status'
import Builder from './builder'

const modelIds = identify('core' as Component, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Emb: CORE_CLASS_EMB as Ref<Class<Emb>>, //eslint-disable-line
    Doc: CORE_CLASS_DOC as Ref<Class<Doc>>, // eslint-disable-line

    Classifier: '' as Ref<Class<Classifier>>,

    Attribute: '' as Ref<Class<Attribute>>,
    Class: CORE_CLASS_CLASS as Ref<Class<Class<Obj>>>, // eslint-disable-line
    Mixin: CORE_CLASS_MIXIN as Ref<Class<Mixin<Obj>>>, // eslint-disable-line

    EnumLiteral: '' as Ref<Class<EnumLiteral>>,
    Enum: '' as Ref<Class<Enum<any>>>,

    // Data types
    Type: CORE_CLASS_TYPE as Ref<Class<Type>>, // eslint-disable-line
    String: CORE_CLASS_STRING as Ref<Class<Type>>, //eslint-disable-line
    Number: '' as Ref<Class<Type>>,
    Boolean: '' as Ref<Class<Type>>,
    Date: '' as Ref<Class<Type>>,
    ArrayOf: CORE_CLASS_ARRAY_OF as Ref<Class<ArrayOf>>, // eslint-disable-line
    RefTo: CORE_CLASS_REF_TO as Ref<Class<RefTo<Doc>>>, // eslint-disable-line
    BagOf: CORE_CLASS_BAG_OF as Ref<Class<BagOf>>,  // eslint-disable-line
    InstanceOf: CORE_CLASS_INSTANCE_OF as Ref<Class<InstanceOf<Emb>>>, // eslint-disable-line
    EnumOf: CORE_CLASS_ENUM_OF as Ref<Class<EnumOf<EnumKey>>>, // eslint-disable-line

    Tx: '' as Ref<Class<Tx>>,
    ObjectTx: CORE_CLASS_OBJECT_TX as Ref<Class<ObjectTx>>, // eslint-disable-line
    ObjectTxDetails: CORE_CLASS_OBJECTTX_DETAILS as Ref<Class<ObjectTxDetails>>, // eslint-disable-line
    CreateTx: CORE_CLASS_CREATE_TX as Ref<Class<CreateTx>>, // eslint-disable-line
    UpdateTx: CORE_CLASS_UPDATE_TX as Ref<Class<UpdateTx>>, // eslint-disable-line
    ObjectSelector: CORE_CLASS_OBJECT_SELECTOR as Ref<Class<ObjectSelector>>, // eslint-disable-line
    TxOperation: CORE_CLASS_TX_OPERATION as Ref<Class<TxOperation>>, // eslint-disable-line
    DeleteTx: CORE_CLASS_DELETE_TX as Ref<Class<DeleteTx>>, // eslint-disable-line

    Title: '' as Ref<Class<Title>>,

    VDoc: '' as Ref<Class<VDoc>>,

    Space: CORE_CLASS_SPACE as Ref<Class<Space>>, // eslint-disable-line
    SpaceUser: CORE_CLASS_SPACE_USER as Ref<Class<SpaceUser>>, // eslint-disable-line

    Reference: '' as Ref<Class<Reference>>,

    Application: '' as Ref<Class<Application>>
  },
  mixin: {
    Indices: '' as Ref<Mixin<Indices>>,
    ObjectTxDetails: '' as Ref<Mixin<ObjectTxDetails>>,
    ShortID: CORE_MIXIN_SHORTID as Ref<Mixin<ShortID>>, // eslint-disable-line
  }
})
export default modelIds

export * from './dsl'
export { Builder }
