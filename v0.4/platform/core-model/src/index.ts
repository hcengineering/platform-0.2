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

import core, {
  Attribute, Class, Classifier, Doc, Emb, Enum, EnumLiteral, Mixin, Obj,
  CollectionOf, EnumOf, InstanceOf, RefTo,
  Tx, Type, ClassifierKind, MODEL_DOMAIN
} from '@anticrm/core'
import { Builder } from '@anticrm/model'

export function model (S: Builder): void {
  S.loadEnum(__filename, core.enum, {
    ClassifierKind: {} as Enum<ClassifierKind>, // eslint-disable-line
  })
  S.loadClass(__filename, core.class, {
    Obj: { } as Class<Obj>, // eslint-disable-line
    Emb: { } as Class<Emb>, // eslint-disable-line
    Doc: { } as Class<Doc>, // eslint-disable-line
    Attribute: { } as Class<Attribute>, // eslint-disable-line
    Classifier: { } as Class<Classifier>, // eslint-disable-line
    Class: { } as Class<Class<any>>, // eslint-disable-line
    Mixin: { } as Class<Mixin<any>>, // eslint-disable-line
    Enum: { } as Class<Enum<any>>, // eslint-disable-line
    EnumLiteral: { } as Class<EnumLiteral>, // eslint-disable-line

    Type: { } as Class<Type>, // eslint-disable-line
    String: { _extends: core.class.Type } as Class<Type>, // eslint-disable-line
    Number: { _extends: core.class.Type } as Class<Type>, // eslint-disable-line
    Boolean: { _extends: core.class.Type } as Class<Type>, // eslint-disable-line
    Any: { _extends: core.class.Type } as Class<Type>, // eslint-disable-line
    Date: { _extends: core.class.Type } as Class<Type>, // eslint-disable-line
    RefTo: { } as Class<RefTo<Doc>>, // eslint-disable-line
    InstanceOf: { } as Class<InstanceOf<Emb>>, // eslint-disable-line
    CollectionOf: { } as Class<CollectionOf<Emb>>, // eslint-disable-line
    EnumOf: { } as Class<EnumOf>, // eslint-disable-line

    Tx: { } as Class<Tx> // eslint-disable-line
  }, MODEL_DOMAIN)
}
