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
  Attribute, Class, Classifier, Doc, Emb, Mixin, Obj, Ref, Tx, Type, VDoc, ArrayOf,
  BagOf, InstanceOf, Indices, Space, Application, List,
  DateProperty, StringProperty, PropertyType, Backlinks, Backlink,
  ClassifierKind, AllAttributes,
  BACKLINKS_DOMAIN, MODEL_DOMAIN, TX_DOMAIN, TITLE_DOMAIN, CORE_CLASS_ARRAY, CORE_CLASS_TEXT,
  CreateTx, PushTx, UpdateTx, DeleteTx, RefTo, AnyLayout, Title
} from '@anticrm/core'

import { extendIds, Class$, Prop, Builder, RefTo$, BagOf$, InstanceOf$, Mixin$ } from '@anticrm/model'
import _core from '@anticrm/platform-core'

const core = extendIds(_core, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Emb: '' as Ref<Class<Emb>>,
    Doc: '' as Ref<Class<Doc>>,

    Classifier: '' as Ref<Class<Classifier<Obj>>>,
    Mixin: '' as Ref<Class<Mixin<Doc>>>,

    Attribute: '' as Ref<Class<Attribute>>,
    Type: '' as Ref<Class<Type>>,
    Text: CORE_CLASS_TEXT,

    Tx: '' as Ref<Class<Tx>>,

    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Emb>>>,
    BagOf: '' as Ref<Class<BagOf>>,
    ArrayOf: CORE_CLASS_ARRAY, // '' as Ref<Class<ArrayOf<Type>>>,

    String: '' as Ref<Class<Type>>,
    Application: '' as Ref<Class<Application>>
  },
  mixin: {
    Indices: '' as Ref<Mixin<Indices>>
  }
})

export default core

@Class$(core.class.Obj, core.class.Obj)
class TObj implements Obj {
  _class!: Ref<Class<Obj>>
}

@Class$(core.class.Emb, core.class.Obj)
export class TEmb extends TObj implements Emb {
  __embedded!: true
}

@Class$(core.class.Doc, core.class.Obj)
class TDoc extends TObj implements Doc {
  _class!: Ref<Class<Doc>>
  @Prop() _id!: Ref<Doc>
  @Prop() _mixins?: Ref<Mixin<Doc>>[]
}

@Class$(core.class.Application, core.class.Doc, MODEL_DOMAIN)
export class TApplication extends TDoc implements Application {
}

@Class$(core.class.Space, core.class.Doc, MODEL_DOMAIN)
export class TSpace extends TDoc implements Space {
  @Prop() name!: string
  @Prop() lists!: List[]
}

@Class$(core.class.VDoc, core.class.Doc)
export class TVDoc extends TDoc implements VDoc {
  @Prop() _space!: Ref<Space>
  @Prop() _createdOn!: DateProperty
  @Prop() _createdBy!: StringProperty
  @Prop() _modifiedOn?: DateProperty
  @Prop() _modifiedBy?: StringProperty
}

@Class$(core.class.Backlinks, core.class.Doc, BACKLINKS_DOMAIN)
class TBacklinks extends TDoc implements Backlinks {
  @Prop() _objectId!: Ref<VDoc>
  @Prop() _objectClass!: Ref<Class<VDoc>>
  @Prop() backlinks!: Backlink[]
}

@Class$(core.class.Attribute, core.class.Emb, MODEL_DOMAIN)
class TAttribute extends TEmb implements Attribute {
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
class TClassifier extends TDoc implements Classifier<Doc> {
  @Prop() _kind!: ClassifierKind

  @BagOf$()
  @InstanceOf$(core.class.Type) _attributes!: AllAttributes<Doc, Obj>

  @RefTo$(core.class.Class) _extends?: Ref<Classifier<Doc>>
}

@Class$(core.class.Class, core.class.Classifier, MODEL_DOMAIN)
class TClass extends TClassifier implements Class<Doc> {
  @Prop() _native?: StringProperty
  @Prop() _domain?: StringProperty
}

@Class$(core.class.Mixin, core.class.Class, MODEL_DOMAIN)
class TMixin extends TClass implements Mixin<Doc> {
}

@Class$(core.class.Title, core.class.Doc, TITLE_DOMAIN)
class TTitle extends TDoc implements Title {
  @RefTo$(core.class.Class) _objectClass!: Ref<Classifier<Doc>>
  @Prop() _objectId!: Ref<Doc>
  @Prop() title!: string | number
}

// T R A N S A C T I O N S
@Class$(core.class.Tx, core.class.Doc, TX_DOMAIN)
export class TTx extends TDoc implements Tx {
  @Prop() _date!: DateProperty
  @Prop() _user!: StringProperty
}

@Class$(core.class.CreateTx, core.class.Tx, TX_DOMAIN)
export class TCreateTx extends TTx implements CreateTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>

  @BagOf$()
  @InstanceOf$(core.class.Type) object!: AnyLayout
}

@Class$(core.class.PushTx, core.class.Tx, TX_DOMAIN)
export class TPushTx extends TTx implements PushTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @Prop() _attribute!: StringProperty

  @BagOf$()
  @InstanceOf$(core.class.Type) _attributes!: AnyLayout
}

@Class$(core.class.UpdateTx, core.class.Tx, TX_DOMAIN)
export class TUpdateTx extends TTx implements UpdateTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>

  @BagOf$()
  @InstanceOf$(core.class.Type) _attributes!: AnyLayout
}

@Class$(core.class.DeleteTx, core.class.Tx, TX_DOMAIN)
export class TDeleteTx extends TTx implements DeleteTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
}

@Mixin$(core.mixin.Indices, core.class.Class)
export class TIndexesClass extends TMixin implements Indices {
  @Prop() primary!: StringProperty
}

export function model (S: Builder): void {
  S.add(TObj, TEmb, TDoc, TVDoc, TBacklinks, TApplication, TSpace, TAttribute, TType, TRefTo, TArrayOf, TClassifier, TClass, TMixin, TTitle)

  S.add(TTx, TCreateTx, TPushTx, TUpdateTx, TDeleteTx)

  S.add(TIndexesClass)
}
