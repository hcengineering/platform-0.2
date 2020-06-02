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


import { Platform } from '@anticrm/platform'
import core, { CoreService, Ref, Class, Obj, Type, Instance } from '@anticrm/platform-core'
import ui, { UIService, UIModel, AttrModel } from '.'

console.log('Plugin `face` loaded')

/*!
 * Anticrm Platform™ Face Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService }): Promise<UIService> => {
  console.log('Plugin `face` started')
  const coreService = deps.core

  // U I  M O D E L S

  async function getClassModel (_class: Ref<Class<Obj>>): Promise<UIModel> {
    const clazz = await coreService.getInstance(_class)
    const decorator = await coreService.as(clazz, ui.class.ClassUIDecorator)
    const label = await decorator.label ?? _class
    return {
      label,
      icon: decorator?.icon
    }
  }

  function groupByType (model: AttrModel[]): { [key: string]: AttrModel[] } {
    const result = {} as { [key: string]: AttrModel[] }
    model.forEach(attr => {
      const type = attr.type._class
      let byType = result[type]
      if (!byType) {
        byType = [] as AttrModel[]
        result[type] = byType
      }
      byType.push(attr)
    })
    return result
  }

  /**
   Attribute label search order
   1. Property `Type`'s UI Decorator `label` attribute
   2. Property `Type`'s synthetic id

   3. Property `Type`'s Class UI Decorator `label` attribute
   4. Property `Type`'s Class synthetic id
   */
  async function getOwnAttrModel (_class: Ref<Class<Obj>>, exclude?: string[] | string): Promise<AttrModel[]> {
    const clazz = await coreService.getInstance(_class)
    const decorator = await coreService.as(clazz, ui.class.ClassUIDecorator)
    const keys = Object.getOwnPropertyNames(clazz._attributes).filter(key => !exclude?.includes(key))

    const attributes = clazz._attributes as { [key: string]: Instance<Type<any>> }
    const attrs = keys.map(async (key) => {
      const type = await attributes[key]
      const typeDecorator = await decorator.decorators?.[key]

      const typeClass = await coreService.getInstance(type._class)
      const typeClassDecorator = await coreService.as(typeClass, ui.class.ClassUIDecorator)

      const label = await typeDecorator?.label ?? await typeClassDecorator?.label ?? key
      const placeholder = (await typeDecorator?.placeholder) ?? label

      const icon = await typeDecorator?.icon ?? await typeClassDecorator?.icon
      return {
        key,
        type,
        label,
        placeholder,
        icon
      } as AttrModel
    })
    return Promise.all(attrs)
  }

  async function getAttrModel (_class: Ref<Class<Obj>>, exclude?: string[] | string, top?: Ref<Class<Obj>>): Promise<AttrModel[]> {
    const hierarchy = coreService.getClassHierarchy(_class, top ?? core.class.Doc)
    const ownModels = hierarchy.map(clazz => getOwnAttrModel(clazz, exclude))
    return Promise.all(ownModels).then(result => result.flat())
  }

  // S E R V I C E

  return {
    getClassModel,
    getOwnAttrModel,
    getAttrModel,
    groupByType,
  }


}