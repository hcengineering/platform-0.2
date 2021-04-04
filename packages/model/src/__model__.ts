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

import core, { ArrayOf$, Builder, Class$, InstanceOf$, Mixin$, Primary, Prop, RefTo$ } from '.'

import { Class, DateProperty, Doc, Emb, MODEL_DOMAIN, Ref, SPACE_DOMAIN, StringProperty, Type } from '@anticrm/core'

import { Application, ShortID, Space, SpaceUser, Title, TITLE_DOMAIN, TitleSource, VDoc } from '@anticrm/domains'

import {
  TArrayOf, TAttribute, TClass, TClassifier, TDoc, TEmb, TEnum, TEnumLiteral, TIndexesClass, TMixin, TObj, TRefTo, TType
} from './models/core'
import { TCreateTx, TDeleteTx, TPushTx, TTx, TUpdateTx } from './models/tx'
import { TReference } from './models/references'

export * from './models/core'
export * from './models/tx'
export * from './models/references'

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

@Class$(core.class.SpaceUser, core.class.Emb, SPACE_DOMAIN)
export class TSpaceUser extends TEmb implements SpaceUser {
  @Prop() userId!: string
  @Prop() owner!: boolean
}

@Class$(core.class.Space, core.class.Doc, SPACE_DOMAIN)
export class TSpace extends TDoc implements Space {
  @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @RefTo$(core.class.Application) application!: Ref<Application>
  @InstanceOf$(core.class.Emb) applicationSettings?: Emb

  @Prop() spaceKey!: string

  @ArrayOf$()
  @InstanceOf$(core.class.SpaceUser) users!: SpaceUser[]

  @Prop(core.class.Boolean) isPublic!: boolean

  @Prop(core.class.Boolean) archived!: boolean
}

@Class$(core.class.VDoc, core.class.Doc, MODEL_DOMAIN)
export class TVDoc extends TDoc implements VDoc {
  @RefTo$(core.class.Space) _space!: Ref<Space>
  @Prop() _createdOn!: DateProperty
  @Prop() _createdBy!: StringProperty
  @Prop() _modifiedOn?: DateProperty
  @Prop() _modifiedBy?: StringProperty
}

@Mixin$(core.mixin.ShortID, core.class.VDoc)
export class TVShortID extends TVDoc implements ShortID {
  @Prop() shortId!: string
}

@Class$(core.class.Application, core.class.Doc, MODEL_DOMAIN)
export class TApplication extends TDoc implements Application {
}

@Class$(core.class.Title, core.class.Doc, TITLE_DOMAIN)
export class TTitle extends TDoc implements Title {
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @Prop() title!: string | number
  @Prop() source!: TitleSource
}

export function model (S: Builder): void {
  S.add(TObj, TEmb, TDoc, TAttribute, TType, TRefTo, TArrayOf, TClassifier, TClass, TMixin, TEnumLiteral, TEnum)
  S.add(TIndexesClass, TVShortID)
  S.add(TStringType, TNumberType, TBooleanType, TDateType)
  S.add(TVDoc, TReference, TTitle, TApplication)
  S.add(TTx, TCreateTx, TPushTx, TUpdateTx, TDeleteTx)
  S.add(TSpace, TSpaceUser)
}
