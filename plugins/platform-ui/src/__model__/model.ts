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

import core from '@anticrm/platform-core/src/__model__'
import { ClassKind } from '@anticrm/platform-core'
import i18n from '@anticrm/platform-core-i18n/src/__model__'
import ui from '.'
import { ComponentKind } from '..'

import Builder from '@anticrm/platform-core/src/__model__/builder'

export default (S: Builder) => {
  S.createClass(ui.class.TypeUIDecorator, core.class.Type, {
    label: S.newInstance(i18n.class.IntlString, {}),
    icon: S.newInstance(core.class.Metadata, {}),
    placeholder: S.newInstance(i18n.class.IntlString, {})
  })

  S.createClass(ui.class.ClassUIDecorator, core.class.Class, {
    label: S.newInstance(i18n.class.IntlString, {}),
    icon: S.newInstance(core.class.Type, {}),
    decorators: S.newInstance(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, {
        of: ui.class.TypeUIDecorator
      })
    })
  })

  S.createClass(ui.class.Form, ui.class.ClassUIDecorator, {
    form: S.newInstance(core.class.Type, {})
  })

  S.createDocument(core.class.Adapter, {
    from: S.primitive(ClassKind),
    to: S.primitive(ComponentKind),
    adapt: S.resolve(ui.method.ClassToComponent) as any // TODO: types
  })


  S.mixin(core.class.Date, ui.class.TypeClassUIDecorator, {
    presenter: S.resolve(ui.component.DatePresenter)
  })
}
