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
  Class$, Prop, Builder, RefTo$, BagOf$, InstanceOf$, Mixin$
} from '.'

import {
  Attribute, Class, Classifier, Doc, Emb, Mixin, Obj, Ref, Type, ArrayOf,
  Indices,
  StringProperty, PropertyType,
  ClassifierKind, AllAttributes,
  RefTo, MODEL_DOMAIN
} from '@anticrm/core'

@Class$(core.class.Obj, core.class.Obj)
export class TObj implements Obj {
  _class!: Ref<Class<Obj>>
}

@Class$(core.class.Emb, core.class.Obj)
export class TEmb extends TObj implements Emb {
  __embedded!: true
}

@Class$(core.class.Doc, core.class.Obj)
export class TDoc extends TObj implements Doc {
  _class!: Ref<Class<Doc>>
  @Prop() _id!: Ref<Doc>
  @Prop() _mixins?: Ref<Mixin<Doc>>[]
}

@Class$(core.class.Attribute, core.class.Emb, MODEL_DOMAIN)
export class TAttribute extends TEmb implements Attribute {
  @Prop() type!: Type
}

@Class$(core.class.Type, core.class.Emb, MODEL_DOMAIN)
class TType extends TEmb implements Type {
  @Prop() _default!: PropertyType
}

@Class$(core.class.RefTo, core.class.Type, MODEL_DOMAIN)
class TRefTo extends TType implements RefTo<Doc> {
  @Prop() to!: Ref<Class<Doc>>
}

@Class$(core.class.ArrayOf, core.class.Type, MODEL_DOMAIN)
class TArrayOf extends TType implements ArrayOf {
  @Prop() of!: Type
}

@Class$(core.class.Classifier, core.class.Doc, MODEL_DOMAIN)
class TClassifier<T extends Obj> extends TDoc implements Classifier<T> {
  @Prop() _kind!: ClassifierKind

  @BagOf$()
  @InstanceOf$(core.class.Emb) _attributes!: AllAttributes<T, Obj>

  @RefTo$(core.class.Class) _extends?: Ref<Classifier<Doc>>
}

@Class$(core.class.Class, core.class.Classifier, MODEL_DOMAIN)
export class TClass<T extends Obj> extends TClassifier<T> implements Class<T> {
  @Prop() _native?: StringProperty
  @Prop() _domain?: StringProperty
}

@Class$(core.class.Mixin, core.class.Class, MODEL_DOMAIN)
export class TMixin<T extends Obj> extends TClass<T> implements Mixin<T> {
}

@Mixin$(core.mixin.Indices, core.class.Class)
export class TIndexesClass<T extends Doc> extends TMixin<T> implements Indices {
  @Prop() primary!: StringProperty
}

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

export function model (S: Builder): void {
  S.add(TObj, TEmb, TDoc, TAttribute, TType, TRefTo, TArrayOf, TClassifier, TClass, TMixin)

  S.add(TIndexesClass)

  S.add(TStringType, TNumberType, TBooleanType)
}
