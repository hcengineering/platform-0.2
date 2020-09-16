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

import { extendIds, Builder } from '@anticrm/model'
import core from '@anticrm/platform-core/src/__model__'

import _ui from '.'

const ui = extendIds(_ui, {
  class: {
  }
})

export default ui

export function model (S: Builder) {
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
    presenter: ui.component.StringPresenter
  })

  S.mixin(core.class.RefTo, ui.class.Presenter, {
    presenter: ui.component.RefPresenter
  })

  S.createMixin(ui.class.DetailForm, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })

  S.createMixin(ui.class.LookupForm, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })
}

import { Doc, mixinKey } from '@anticrm/core'
import { getAttribute, getClassifier } from '@anticrm/model'
import { IntlString } from '@anticrm/platform-i18n'
import { Asset } from '@anticrm/platform-ui'
import { AttributeUI } from '.'

export function UX (label: IntlString, icon?: Asset) {
  function uxProp (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    attribute._class = ui.class.AttributeUI
    const attrUI = attribute as AttributeUI
    attrUI.label = label
    if (icon) {
      attrUI.icon = icon
    }
  }

  function uxClass<C extends { new(): Doc }> (
    constructor: C
  ) {
    const classifier = getClassifier(constructor.prototype)
    if (!classifier._mixins) {
      classifier._mixins = [ui.mixin.UXObject]
    } else {
      classifier._mixins.push(ui.mixin.UXObject)
    }
    const doc = classifier as any
    doc[mixinKey(ui.mixin.UXObject, 'label')] = label
    if (icon) {
      doc[mixinKey(ui.mixin.UXObject, 'icon')] = icon
    }
  }

  return function (this: any, ...args: any[]) {
    switch (args.length) {
      case 1:
        return uxClass.apply(this, args as [{ new(): Doc }])
      case 2:
      case 3:
        return uxProp.apply(this, args as [any, string])
      default:
        throw new Error('unsupported decorator')
    }
  }
}
