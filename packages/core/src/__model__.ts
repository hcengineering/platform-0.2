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

import {
  Class$, Prop, Builder, RefTo$, BagOf$, InstanceOf$, ArrayOf$, Primary
} from '@anticrm/model'
import {
  Class, Classifier, Doc, Ref,
  DateProperty, StringProperty, AnyLayout
} from './classes'
import { MODEL_DOMAIN } from './model'

import { TDoc, TEmb } from '@anticrm/model/src/__model__'

import core, { Space, SpaceUser, VDoc } from '.'
import { Backlink, Backlinks, BACKLINKS_DOMAIN } from './text'
import { Title, TITLE_DOMAIN } from './title'
import { CreateTx, DeleteTx, PushTx, TX_DOMAIN, UpdateTx, Tx } from './tx'
import { Application } from './vdoc'

@Class$(core.class.SpaceUser, core.class.Emb, MODEL_DOMAIN)
export class TSpaceUser extends TEmb implements SpaceUser {
  @Prop() userId!: string
  @Prop() owner!: boolean
}

@Class$(core.class.Space, core.class.Doc, MODEL_DOMAIN)
export class TSpace extends TDoc implements Space {
  @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @ArrayOf$()
  @InstanceOf$(core.class.SpaceUser) users!: SpaceUser[]

  @Prop(core.class.Boolean) isPublic!: boolean

  @Prop(core.class.Boolean) archived!: boolean
}

@Class$(core.class.VDoc, core.class.Doc)
export class TVDoc extends TDoc implements VDoc {
  @Prop() _space!: Ref<Space>
  @Prop() _createdOn!: DateProperty
  @Prop() _createdBy!: StringProperty
  @Prop() _modifiedOn?: DateProperty
  @Prop() _modifiedBy?: StringProperty
}

@Class$(core.class.Application, core.class.Doc, MODEL_DOMAIN)
export class TApplication extends TDoc implements Application {
}

@Class$(core.class.Backlinks, core.class.Doc, BACKLINKS_DOMAIN)
class TBacklinks extends TDoc implements Backlinks {
  @Prop() _objectId!: Ref<VDoc>
  @Prop() _objectClass!: Ref<Class<VDoc>>
  @Prop() backlinks!: Backlink[]
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
  @InstanceOf$(core.class.Emb) object!: AnyLayout
}

@Class$(core.class.PushTx, core.class.Tx, TX_DOMAIN)
export class TPushTx extends TTx implements PushTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @Prop() _attribute!: StringProperty

  @BagOf$()
  @InstanceOf$(core.class.Emb) _attributes!: AnyLayout

  @Prop() _query!: AnyLayout
}

@Class$(core.class.UpdateTx, core.class.Tx, TX_DOMAIN)
export class TUpdateTx extends TTx implements UpdateTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>

  @BagOf$()
  @InstanceOf$(core.class.Emb) _attributes!: AnyLayout

  @Prop() _query!: AnyLayout
}

@Class$(core.class.DeleteTx, core.class.Tx, TX_DOMAIN)
export class TDeleteTx extends TTx implements DeleteTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>

  @Prop() _query!: unknown
}

export function model (S: Builder): void {
  S.add(TVDoc, TBacklinks, TTitle, TApplication)

  S.add(TTx, TCreateTx, TPushTx, TUpdateTx, TDeleteTx)

  S.add(TSpace, TSpaceUser)
}
