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

import type { Enum, EnumLiteral, EnumOf } from '@anticrm/core'
import {
  Attribute, Class, Classifier, CORE_CLASS_ARRAY_OF, CORE_CLASS_BAG_OF, CORE_CLASS_CLASS,
  CORE_CLASS_DOC, CORE_CLASS_EMB, CORE_CLASS_ENUM_OF, CORE_CLASS_INSTANCE_OF, CORE_CLASS_MIXIN, CORE_CLASS_REF_TO,
  CORE_CLASS_STRING,
  CORE_CLASS_TYPE, Indices, Mixin, Obj, Ref, Tx, Type
} from '@anticrm/core'
import {
  Application, CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX,
  CORE_CLASS_OBJECTTX_DETAILS, CORE_CLASS_OBJECT_SELECTOR, CORE_CLASS_OBJECT_TX,
  CORE_CLASS_SPACE,
  CORE_CLASS_SPACE_USER, CORE_CLASS_TX_OPERATION,
  CORE_CLASS_UPDATE_TX, CORE_MIXIN_SHORTID,
  Reference,
  Title,
  VDoc
} from '@anticrm/domains'
import { AnyPlugin, identify } from '@anticrm/platform'
import Builder from './builder'

const modelIds = identify('core' as AnyPlugin, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Emb: CORE_CLASS_EMB,
    Doc: CORE_CLASS_DOC,

    Classifier: '' as Ref<Class<Classifier>>,

    Attribute: '' as Ref<Class<Attribute>>,
    Class: CORE_CLASS_CLASS,
    Mixin: CORE_CLASS_MIXIN,

    EnumLiteral: '' as Ref<Class<EnumLiteral>>,
    Enum: '' as Ref<Class<Enum<any>>>,

    // Data types
    Type: CORE_CLASS_TYPE,
    String: CORE_CLASS_STRING,
    Number: '' as Ref<Class<Type>>,
    Boolean: '' as Ref<Class<Type>>,
    Date: '' as Ref<Class<Type>>,
    ArrayOf: CORE_CLASS_ARRAY_OF,
    RefTo: CORE_CLASS_REF_TO,
    BagOf: CORE_CLASS_BAG_OF,
    InstanceOf: CORE_CLASS_INSTANCE_OF,
    EnumOf: CORE_CLASS_ENUM_OF as Ref<Class<EnumOf<any>>>,

    Tx: '' as Ref<Class<Tx>>,
    ObjectTx: CORE_CLASS_OBJECT_TX,
    ObjectTxDetails: CORE_CLASS_OBJECTTX_DETAILS,
    CreateTx: CORE_CLASS_CREATE_TX,
    UpdateTx: CORE_CLASS_UPDATE_TX,
    ObjectSelector: CORE_CLASS_OBJECT_SELECTOR,
    TxOperation: CORE_CLASS_TX_OPERATION,
    DeleteTx: CORE_CLASS_DELETE_TX,

    Title: '' as Ref<Class<Title>>,

    VDoc: '' as Ref<Class<VDoc>>,

    Space: CORE_CLASS_SPACE,
    SpaceUser: CORE_CLASS_SPACE_USER,

    Reference: '' as Ref<Class<Reference>>,

    Application: '' as Ref<Class<Application>>
  },
  mixin: {
    Indices: '' as Ref<Mixin<Indices>>,
    ShortID: CORE_MIXIN_SHORTID
  }
})
export default modelIds

export * from './dsl'
export * from './utils'
export { Builder }
