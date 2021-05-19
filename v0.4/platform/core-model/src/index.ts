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

import core, { MODEL_DOMAIN, Type } from '@anticrm/core'
import { Builder, Class$ } from '@anticrm/model'
import {
  TAttribute, TClass, TClassifier, TCollectionOf, TDoc, TEmb, TEnum, TEnumLiteral, TEnumOf,
  TInstanceOf,
  TMixin, TObj,
  TRefTo, TType
} from './classes'
export * from './classes'

// Primitive types

@Class$(core.class.String, core.class.Type, MODEL_DOMAIN)
class TStringType extends TType implements Type {
}

@Class$(core.class.Number, core.class.Type, MODEL_DOMAIN)
class TNumberType extends TType implements Type {
}

@Class$(core.class.Boolean, core.class.Type, MODEL_DOMAIN)
class TBooleanType extends TType implements Type {
}

@Class$(core.class.Date, core.class.Type, MODEL_DOMAIN)
class TDateType extends TType implements Type {
}

export function model (S: Builder): void {
  S.add(TObj, TEmb, TDoc, TAttribute, TType, TRefTo, TInstanceOf, TEnumOf, TCollectionOf, TClassifier, TClass, TMixin, TEnumLiteral, TEnum)
  S.add(TStringType, TNumberType, TBooleanType, TDateType)
}
