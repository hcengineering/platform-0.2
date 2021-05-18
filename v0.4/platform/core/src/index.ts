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

import { Component, identify } from '@anticrm/status'
import { Attribute, Class, Classifier, CollectionOf, Doc, Emb, Enum, EnumLiteral, EnumOf, Mixin, Obj, Ref, RefTo, Type } from './classes'
import { Tx } from './storage'

export * from './classes'
export * from './ids'
export * from './model'
export * from './storage'

export default identify('core' as Component, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Doc: '' as Ref<Class<Doc>>,
    Emb: '' as Ref<Class<Emb>>,
    Class: '' as Ref<Class<Class<Obj>>>,
    Classifier: '' as Ref<Class<Classifier>>,
    Attribute: '' as Ref<Class<Attribute>>,
    Mixin: '' as Ref<Class<Mixin<Obj>>>,
    Enum: '' as Ref<Class<Enum>>,
    EnumLiteral: '' as Ref<Class<EnumLiteral>>,

    String: '' as Ref<Class<Type>>,
    Number: '' as Ref<Class<Type>>,
    Boolean: '' as Ref<Class<Type>>,
    Date: '' as Ref<Class<Type>>,
    Type: '' as Ref<Class<Type>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    CollectionOf: '' as Ref<Class<CollectionOf<Emb>>>,
    EnumOf: '' as Ref<Class<EnumOf>>,

    Tx: '' as Ref<Class<Tx>>
  }
})
