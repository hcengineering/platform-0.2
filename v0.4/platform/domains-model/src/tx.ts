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
import core, { AnyLayout, Class, Doc, Emb, Ref, Tx } from '@anticrm/core'
import { TDoc } from '@anticrm/core-model'
import domains, { AddItemTx, CreateTx, DeleteTx, ItemTx, ObjectTx, RemoveItemTx, Space, TX_DOMAIN, UpdateItemTx, UpdateTx } from '@anticrm/domains'
import { Class$, Prop, RefTo$ } from '@anticrm/model'

@Class$(core.class.Tx, core.class.Doc, TX_DOMAIN)
export class TTx extends TDoc implements Tx {
  @Prop() _date!: number
  @Prop() _user!: string
}

@Class$(domains.class.ObjectTx, core.class.Doc, TX_DOMAIN)
export class TObjectTx extends TTx implements ObjectTx {
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @RefTo$(domains.class.Space) _objectSpace!: Ref<Space>
}

@Class$(domains.class.CreateTx, core.class.Tx, TX_DOMAIN)
export class TCreateTx extends TObjectTx implements CreateTx {
  @Prop() attributes!: AnyLayout
}

@Class$(domains.class.UpdateTx, core.class.Tx, TX_DOMAIN)
export class TUpdateTx extends TObjectTx implements UpdateTx {
  @Prop() attributes!: AnyLayout
}

@Class$(domains.class.DeleteTx, core.class.Tx, TX_DOMAIN)
export class TDeleteTx extends TObjectTx implements DeleteTx {
}

// Collections

@Class$(domains.class.ItemTx, domains.class.ObjectTx, TX_DOMAIN)
export class TItemTx extends TObjectTx implements ItemTx {
  @RefTo$(core.class.Emb) _itemId!: Ref<Emb>
  @RefTo$(core.class.Class) _itemClass!: Ref<Class<Doc>>

  @Prop() _collection!: string
}

@Class$(domains.class.AddItemTx, domains.class.ItemTx, TX_DOMAIN)
export class TAddItemTx extends TItemTx implements AddItemTx {
  @Prop() attributes!: AnyLayout
}

@Class$(domains.class.UpdateItemTx, domains.class.ItemTx, TX_DOMAIN)
export class TUpdateItemTx extends TItemTx implements UpdateItemTx {
  @Prop() attributes!: AnyLayout
}

@Class$(domains.class.RemoveItemTx, domains.class.ItemTx, TX_DOMAIN)
export class TRemoveItemTx extends TItemTx implements RemoveItemTx {
}
