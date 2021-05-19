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

import core, { Class, Collection, Doc, MODEL_DOMAIN, Ref, Type } from '@anticrm/core'
import domains, { Application, Indices, ShortID, Space, SpaceUser, Title, TitleSource, TITLE_DOMAIN, VDoc, CollectionReference } from '@anticrm/domains'
import { Builder, Class$, Mixin$, Primary, Prop, RefTo$ } from '.'
import { CollectionOf$ } from './dsl'
import {
  TAttribute, TClass, TClassifier, TCollectionOf, TDoc, TEmb, TEnum, TEnumLiteral, TEnumOf,
  TInstanceOf,
  TMixin, TObj,
  TRefTo, TType
} from './models/core'
import { TReference } from './models/references'
import { TAddItemTx, TCreateTx, TDeleteTx, TItemTx, TObjectTx, TRemoveItemTx, TTx, TUpdateItemTx, TUpdateTx } from './models/tx'

export * from './models/core'
export * from './models/references'
export * from './models/tx'

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

///

@Class$(domains.class.SpaceUser, core.class.Emb, MODEL_DOMAIN)
export class TSpaceUser extends TEmb implements SpaceUser {
  @Prop() userId!: string
  @Prop() owner!: boolean
}

@Class$(domains.class.Space, core.class.Doc, MODEL_DOMAIN)
export class TSpace extends TDoc implements Space {
  @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @RefTo$(domains.class.Application) application!: Ref<Application>

  @Prop() applicationSettings?: any

  @Prop() spaceKey!: string

  @CollectionOf$(domains.class.SpaceUser) users!: Collection<SpaceUser>

  @Prop(core.class.Boolean) isPublic!: boolean

  @Prop(core.class.Boolean) archived!: boolean
}

@Class$(domains.class.VDoc, core.class.Doc, MODEL_DOMAIN)
export class TVDoc extends TDoc implements VDoc {
  @RefTo$(domains.class.Space) _space!: Ref<Space>
  @Prop() _createdOn!: number
  @Prop() _createdBy!: string
  @Prop() _modifiedOn?: number
  @Prop() _modifiedBy?: string
}

@Mixin$(domains.mixin.ShortID, domains.class.VDoc)
export class TVShortID extends TVDoc implements ShortID {
  @Prop() shortId!: string
}

@Class$(domains.class.Application, core.class.Doc, MODEL_DOMAIN)
export class TApplication extends TDoc implements Application {
}

@Class$(domains.class.Title, core.class.Doc, TITLE_DOMAIN)
export class TTitle extends TDoc implements Title {
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @Prop() title!: string | number
  @Prop() source!: TitleSource
}

@Mixin$(domains.mixin.Indices, core.class.Mixin)
export class TIndexesClass<T extends Doc> extends TMixin<T> implements Indices {
  @Prop() primary!: string
}

@Mixin$(domains.mixin.CollectionReference, core.class.Emb)
export class TCollectionReference extends TEmb implements CollectionReference {
  @RefTo$(core.class.Doc) _parentId!: Ref<Doc>
  @RefTo$(core.class.Class) _parentClass!: Ref<Class<Doc>>
  @Prop() _collection!: string
  @RefTo$(domains.class.Space) _parentSpace!: Ref<Space>
}

export function model (S: Builder): void {
  S.add(TObj, TEmb, TDoc, TAttribute, TType, TRefTo, TInstanceOf, TEnumOf, TCollectionOf, TCollectionReference, TClassifier, TClass, TMixin, TEnumLiteral, TEnum)
  S.add(TIndexesClass, TVShortID)
  S.add(TStringType, TNumberType, TBooleanType, TDateType)
  S.add(TVDoc, TReference, TTitle, TApplication)
  S.add(TTx, TCreateTx, TUpdateTx, TDeleteTx, TObjectTx, TAddItemTx, TUpdateItemTx, TRemoveItemTx, TItemTx)
  S.add(TSpace, TSpaceUser)
}
