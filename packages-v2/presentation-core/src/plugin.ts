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

import { Attribute, Class, Obj, Platform, Ref } from '@anticrm/platform'
import ui, { AttributeUI, AttrModel, PresentationCore } from '.'
import { CoreService } from '@anticrm/platform-core'
import { Asset } from '@anticrm/platform-ui'
import { I18n } from '@anticrm/platform-i18n'

/*!
 * Anticrm Platform™ Presentation Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService, i18n: I18n }): Promise<PresentationCore> => {

  const coreService = deps.core
  const i18nService = deps.i18n

  async function getOwnAttrModel(_class: Ref<Class<Obj>>): Promise<AttrModel[]> {
    const result = [] as AttrModel[]
    const model = coreService.getModel()
    const clazz = model.get(_class) as Class<Obj>
    const attributes = clazz._attributes as { [key: string]: Attribute }
    for (const key in attributes) {
      const attribute = attributes[key]
      let label = key
      let placeholder = key
      let icon: Asset | undefined
      if (coreService.getModel().is(attribute._class, ui.class.AttributeUI)) {
        const attributeUI = attribute as AttributeUI
        label = await i18nService.translate(attributeUI.label)
        if (attributeUI.placeholder) {
          placeholder = await i18nService.translate(attributeUI.placeholder)
        } else {
          placeholder = label
        }
        icon = attributeUI.icon
      }
      result.push({
        key,
        icon,
        label,
        placeholder,
        type: attribute.type
      })
    }
    return result
  }

  async function getAttrModel(_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<AttrModel[]> {
    const model = coreService.getModel()
    const hierarchy = model.getClassHierarchy(_class, top)
    const ownModels = hierarchy.map(async (_class) => getOwnAttrModel(_class))
    return Promise.all(ownModels).then(result => result.flat())
  }

  return {
    getAttrModel
  }
}