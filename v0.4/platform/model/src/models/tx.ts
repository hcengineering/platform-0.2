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

// T R A N S A C T I O N S
import { AnyLayout, Class, Doc, PrimitiveType, Ref, Tx } from '@anticrm/core'
import { CreateTx, DeleteTx, ObjectSelector, ObjectTx, ObjectTxDetails, Space, TxOperation, TxOperationKind, TX_DOMAIN, UpdateTx } from '@anticrm/domains'
import { ArrayOf$, BagOf$, Class$, InstanceOf$, Mixin$, Prop, RefTo$ } from '../dsl'
import core from '../index'
import { TDoc, TEmb } from './core'

@Class$(core.class.Tx, core.class.Doc, TX_DOMAIN)
export class TTx extends TDoc implements Tx {
  @Prop() _date!: number
  @Prop() _user!: string
}

@Class$(core.class.ObjectTx, core.class.Doc, TX_DOMAIN)
export class TObjectTx extends TTx implements ObjectTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @RefTo$(core.class.Space) _objectSpace!: Ref<Space>
}

@Class$(core.class.CreateTx, core.class.Tx, TX_DOMAIN)
export class TCreateTx extends TObjectTx implements CreateTx {
  @BagOf$()
  @Prop() object!: AnyLayout
}

@Mixin$(core.mixin.ObjectTxDetails, core.class.ObjectTx)
export class TObjectTxDetails extends TObjectTx implements ObjectTxDetails {
  @Prop() name?: string
  @Prop() id?: string
  @Prop() description?: string
}

@Class$(core.class.ObjectSelector, core.class.Emb, TX_DOMAIN)
export class TObjectSelector extends TEmb implements ObjectSelector {
  @Prop() key!: string
  @Prop() pattern?: AnyLayout | PrimitiveType
}

@Class$(core.class.TxOperation, core.class.Emb, TX_DOMAIN)
export class TTxOperation extends TEmb implements TxOperation {
  @Prop() kind!: TxOperationKind

  @ArrayOf$()
  @InstanceOf$(core.class.ObjectSelector)
  selector?: ObjectSelector[]

  // will determine an object or individual value to be updated.
  @BagOf$()
  _attributes?: AnyLayout
}

@Class$(core.class.UpdateTx, core.class.Tx, TX_DOMAIN)
export class TUpdateTx extends TObjectTx implements UpdateTx {
  @ArrayOf$()
  @InstanceOf$(core.class.TxOperation) operations!: TxOperation[]
}

@Class$(core.class.DeleteTx, core.class.Tx, TX_DOMAIN)
export class TDeleteTx extends TObjectTx implements DeleteTx {
}
