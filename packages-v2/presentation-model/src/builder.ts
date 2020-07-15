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

import { Builder } from '@anticrm/platform-model'
import { Attribute, Class, Emb, Obj, OptionalMethods, Ref, Type } from '@anticrm/platform'
import ui, { AttributeUI } from '@anticrm/presentation-core'

export class UIBuilder extends Builder {

  load (model: (builder: UIBuilder) => void) {
    model(this)
  }

  attrUI<M extends Type> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>, aui: Omit<AttributeUI, keyof Attribute>): AttributeUI {
    const type = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return { _class: ui.class.AttributeUI, type, ...aui } as unknown as AttributeUI
  }
}

