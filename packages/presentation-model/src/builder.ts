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
import { AllAttributes, Attribute, Class, Classifier, Emb, Obj, OptionalMethods, Ref, Type, ClassifierKind } from '@anticrm/platform'
import ui, { AttributeUI, ClassUI } from '@anticrm/presentation-core'

export class UIBuilder extends Builder {
  load (model: (builder: UIBuilder) => void) {
    model(this)
  }

  createClassUI<T extends E, E extends Obj> (_id: Ref<ClassUI<T>>, _extends: Ref<Class<E>>, values: Omit<ClassUI<T>, keyof Classifier<Obj>>, _attributes: AllAttributes<T, E>) {
    this.createDocument(ui.class.ClassUI as Ref<Class<ClassUI<T>>>, {
      _kind: ClassifierKind.CLASS,
      _extends,
      _attributes,
      ...values
    } as unknown as ClassUI<T>, _id as Ref<ClassUI<T>>)
  }

  attrUI<M extends Type> (_class: Ref<Class<M>>, values: OptionalMethods<Omit<M, keyof Emb>>, aui: Omit<AttributeUI, keyof Attribute>): AttributeUI {
    const type = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return { _class: ui.class.AttributeUI, type, ...aui } as unknown as AttributeUI
  }
}
