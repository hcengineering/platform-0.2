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

import core, { Class, Doc, Emb, Obj, Ref } from '@anticrm/core'
import { TDoc } from '@anticrm/core-model'
import domains, { Reference, REFERENCE_DOMAIN } from '@anticrm/domains'
import { Class$, Prop, RefTo$ } from '@anticrm/model'

@Class$(domains.class.Reference, core.class.Doc, REFERENCE_DOMAIN)
export class TReference extends TDoc implements Reference {
  @RefTo$(core.class.Doc) _sourceId!: Ref<Doc>
  @RefTo$(core.class.Class) _sourceClass!: Ref<Class<Doc>>

  @RefTo$(core.class.Emb) _itemId?: Ref<Emb>
  @RefTo$(core.class.Class) _itemClass?: Ref<Class<Emb>>
  @Prop() _collection?: string

  @Prop() _sourceField!: string
  @Prop() _sourceIndex!: number

  @RefTo$(core.class.Doc) _targetId?: Ref<Obj>
  @RefTo$(core.class.Class) _targetClass!: Ref<Class<Obj>>
}
