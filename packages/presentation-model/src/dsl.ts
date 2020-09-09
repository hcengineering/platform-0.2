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

import { Doc, mixinKey } from '@anticrm/platform'
import { getAttribute, getClassifier } from '@anticrm/platform-model'
import { IntlString } from '@anticrm/platform-i18n'
import { Asset } from '@anticrm/platform-ui'
import presentationCore, { AttributeUI } from '@anticrm/presentation-core'

export function UX (label: IntlString, icon?: Asset) {

  function uxProp (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    attribute._class = presentationCore.class.AttributeUI
    const attrUI = attribute as AttributeUI
    attrUI.label = label
    if (icon)
      attrUI.icon = icon
  }

  function uxClass<C extends { new(): Doc }> (
    constructor: C
  ) {
    const classifier = getClassifier(constructor.prototype)
    if (!classifier._mixins) {
      classifier._mixins = [presentationCore.mixin.UXObject]
    } else {
      classifier._mixins.push(presentationCore.mixin.UXObject)
    }
    const doc = classifier as any
    doc[mixinKey(presentationCore.mixin.UXObject, 'label')] = label
    if (icon)
      doc[mixinKey(presentationCore.mixin.UXObject, 'icon')] = icon
  }

  return function (this: any, ...args: any[]) {
    switch (args.length) {
      case 1:
        return uxClass.apply(this, args as [{ new(): Doc }])
      case 2:
      case 3:
        return uxProp.apply(this, args as [any, string]);
      default:
        throw new Error("unsupported decorator");
    }
  }
}
