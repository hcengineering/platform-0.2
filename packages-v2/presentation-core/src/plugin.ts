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

import { Attribute, Class, Obj, Platform, Ref, Type } from '@anticrm/platform'
import ui, { AttributeUI, AttrModel, ClassModel, ClassUI, GroupModel, PresentationCore } from '.'
import { CoreService } from '@anticrm/platform-core'
import { Asset } from '@anticrm/platform-ui'
import { I18n, IntlString } from '@anticrm/platform-i18n'

/*!
 * Anticrm Platform™ Presentation Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService, i18n: I18n }): Promise<PresentationCore> => {

  const coreService = deps.core
  const i18nService = deps.i18n

  async function getGroupModel(_class: Ref<ClassUI<Obj>>): Promise<GroupModel> {
    const model = coreService.getModel()
    const clazz = model.get(_class) as ClassUI<Obj>
    const label = await i18nService.translate(clazz.label)

    return { _class, label, icon: clazz.icon }
  }

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
        _class,
        icon,
        label,
        placeholder,
        type: attribute.type
      })
    }
    return result
  }

  abstract class ClassModelBase implements ClassModel {
    filterAttributes(keys: string[]): ClassModel {
      const filter = {} as { [key: string]: {} }
      keys.forEach(key => filter[key] = {})
      return new AttributeFilter(this, filter)
    }
    abstract getAttribute(key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined
    abstract getGroups(): GroupModel[]
    abstract getOwnAttributes(_class: Ref<Class<Obj>>): AttrModel[]
  }

  class TClassModel extends ClassModelBase {

    private readonly attributes: AttrModel[]
    private readonly groups: GroupModel[]

    constructor(groups: GroupModel[], attributes: AttrModel[]) {
      super()
      this.attributes = attributes
      this.groups = groups
    }

    getOwnAttributes(_class: Ref<Class<Obj>>): AttrModel[] {
      return this.attributes.filter(attr => attr._class === _class)
    }

    getAttribute(key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined {
      return this.attributes.find(attr => attr.key === key && (_class ? _class === attr._class : true))
    }

    getGroups(): GroupModel[] { return this.groups }
  }

  class AttributeFilter extends ClassModelBase {
    private readonly next: ClassModel
    private readonly filter: { [key: string]: {} }

    constructor(next: ClassModel, filter: { [key: string]: {} }) {
      super()
      this.next = next
      this.filter = filter
    }

    getAttribute(key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined {
      const result = this.next.getAttribute(key, _class)
      if (result) {
        return this.filter[result.key] ? undefined : result
      }
    }

    getGroups(): GroupModel[] {
      return [];
    }

    getOwnAttributes(_class: Ref<Class<Obj>>): AttrModel[] {
      const result = this.next.getOwnAttributes(_class)
      return result.filter(attr => !this.filter[attr.key])
    }

  }

  async function getClassModel(_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<ClassModel> {
    const model = coreService.getModel()
    const hierarchy = model.getClassHierarchy(_class, top)
    const groupModels = hierarchy.map(_class => getGroupModel(_class as Ref<ClassUI<Obj>>))
    const attrModels = hierarchy.map(_class => getOwnAttrModel(_class))

    const groups = await Promise.all(groupModels)
    const attributes = await Promise.all(attrModels).then(result => result.flat())

    return new TClassModel(groups, attributes)
  }

  function getEmptyModel(): ClassModel {
    return new TClassModel([], [])
  }

  function getEmptyAttribute(_class: Ref<Class<Obj>>): AttrModel {
    return { _class, key: 'non-existent', label: 'Несуществующий аттрибут' as IntlString, placeholder: '' as IntlString, type: null as unknown as Type }
  }

  return {
    getEmptyModel,
    getEmptyAttribute,
    getClassModel
  }
}