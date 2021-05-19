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
  Attribute, Class, Classifier, ClassifierKind, Collection, CollectionOf, Doc, Emb, Enum, EnumLiteral,
  EnumOf, InstanceOf, Mixin, MODEL_DOMAIN, Obj, PropertyType, Ref, RefTo, Type
} from '@anticrm/core'
import { Class$, CollectionOf$, InstanceOf$, Prop, RefTo$ } from '@anticrm/model'

@Class$(core.class.Obj, core.class.Obj)
export class TObj implements Obj {
  @Prop() _id!: Ref<Obj>
  @RefTo$(core.class.Class) _class!: Ref<Class<Obj>>
}

@Class$(core.class.Emb, core.class.Obj)
export class TEmb extends TObj implements Emb {
  _id!: Ref<Emb>
  _class!: Ref<Class<Emb>> // A field to match type, attribute is defined in TObj
}

@Class$(core.class.Doc, core.class.Obj)
export class TDoc extends TObj implements Doc {
  _id!: Ref<Doc>
  _class!: Ref<Class<Doc>> // A field to match type, attribute is defined in TObj
  @Prop() _mixins?: Array<Ref<Mixin<Doc>>>
}

@Class$(core.class.Attribute, core.class.Emb, MODEL_DOMAIN)
export class TAttribute extends TEmb implements Attribute {
  @Prop() name!: string
  @InstanceOf$(core.class.Type) type!: Type
}

@Class$(core.class.Type, core.class.Emb, MODEL_DOMAIN)
export class TType extends TEmb implements Type {
  @Prop() _default!: PropertyType
}

@Class$(core.class.Classifier, core.class.Doc, MODEL_DOMAIN)
export class TClassifier extends TDoc implements Classifier {
  @Prop() _kind!: ClassifierKind
}

@Class$(core.class.Class, core.class.Classifier, MODEL_DOMAIN)
export class TClass<T extends Obj> extends TClassifier implements Class<T> {
  @CollectionOf$(core.class.Attribute) _attributes!: Collection<Attribute>

  @RefTo$(core.class.Class) _extends?: Ref<Class<Doc>>

  @Prop() _native?: string
  @Prop() _domain?: string
}

@Class$(core.class.Mixin, core.class.Class, MODEL_DOMAIN)
export class TMixin<T extends Obj> extends TClass<T> implements Mixin<T> {
}

@Class$(core.class.EnumLiteral, core.class.Emb, MODEL_DOMAIN)
export class TEnumLiteral extends TEmb implements EnumLiteral {
  @Prop() ordinal!: number
  @Prop() label!: string
}

@Class$(core.class.Enum, core.class.Classifier, MODEL_DOMAIN)
export class TEnum extends TClassifier implements Enum {
  @CollectionOf$(core.class.Attribute) _literals!: Collection<EnumLiteral>
}

@Class$(core.class.RefTo, core.class.Type, MODEL_DOMAIN)
export class TRefTo extends TType implements RefTo<Doc> {
  @RefTo$(core.class.Class) to!: Ref<Class<Doc>>
}

@Class$(core.class.EnumOf, core.class.Type, MODEL_DOMAIN)
export class TEnumOf extends TType implements EnumOf {
  @RefTo$(core.class.Enum) of!: Ref<Enum>
}

@Class$(core.class.InstanceOf, core.class.Type, MODEL_DOMAIN)
export class TInstanceOf extends TType implements InstanceOf<Emb> {
  @RefTo$(core.class.Class) of!: Ref<Class<Emb>>
}

@Class$(core.class.CollectionOf, core.class.Type, MODEL_DOMAIN)
export class TCollectionOf extends TType implements CollectionOf<Emb> {
  @RefTo$(core.class.Class) of!: Ref<Class<Emb>>
}
