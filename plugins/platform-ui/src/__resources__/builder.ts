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

import { Session, Type, Ref, Class, Doc, Bag, Content, Obj } from '@anticrm/platform-core'
import { IntlString } from '@anticrm/platform-core-i18n'

import { Builder as CoreBuilder } from '@anticrm/platform-core/src/__resources__/builder'
import { Asset, TypeUIDecorator, ClassUIDecorator } from '..'
import ui from '.'

export class Builder extends CoreBuilder {

  protected session: Session

  constructor(session: Session) {
    super(session)
    this.session = session
  }

  i18n(): Type<IntlString> {
    const meta = this.session.getClass(ui.class.IntlString)
    return meta.newInstance({})
  }

  typeDeco(deco: Content<TypeUIDecorator>) {
    const typeDecorator = this.session.getClass(ui.class.TypeUIDecorator)
    return typeDecorator.newInstance(deco)
  }

  // decorateClass<T extends Obj>(_class: Ref<Class<T>>, decorators: Bag<TypeUIDecorator>, label?: IntlString, icon?: Asset) {
  //   const classClass = this.session.getClass(_class)
  //   return this.session.mixin(classClass, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Class<T>>>>, {
  //     label,
  //     icon,
  //     decorators
  //   })
  // }

  decorateClass<T extends Obj>(_class: Ref<Class<T>>, decorators: Omit<ClassUIDecorator<Class<T>>, keyof Class<T>>) {
    const classClass = this.session.getClass(_class)
    return this.session.mixin(classClass, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Class<T>>>>, decorators)
  }

}
