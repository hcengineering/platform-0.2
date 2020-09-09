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

import core, { Builder } from '@anticrm/platform-model'
import ui from '.'
import presentationUI from '@anticrm/presentation-ui'

export default (S: Builder) => {

  S.createClass(ui.class.AttributeUI, core.class.Attribute, {
    label: S.attr(core.class.Type, {}),
    placeholder: S.attr(core.class.Type, {}),
    icon: S.attr(core.class.Type, {})
  })

  S.createMixin(ui.class.Presenter, core.class.Class, {
    presenter: S.attr(core.class.Type, {})
  })

  S.createMixin(ui.mixin.UXObject, core.class.Doc, {
    label: S.attr(core.class.Type, {}),
    icon: S.attr(core.class.Type, {})
  })

  S.mixin(core.class.Type, ui.class.Presenter, {
    presenter: presentationUI.component.StringPresenter
  })

  S.mixin(core.class.RefTo, ui.class.Presenter, {
    presenter: presentationUI.component.RefPresenter
  })

  S.mixin(core.class.ESFunc, ui.class.Presenter, {
    presenter: presentationUI.component.StringPresenter
  })

  S.createMixin(ui.class.DetailForm, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })

  S.createMixin(ui.class.LookupForm, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })

}
