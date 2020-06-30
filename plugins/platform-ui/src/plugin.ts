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


import { Platform, Resource } from '@anticrm/platform'
import core, { CoreService, Ref, Class, Obj, Doc, Type, Instance, AdapterType, Adapter } from '@anticrm/platform-core'
import ui, { UIService, UIModel, AttrModel, AnyComponent } from '.'

/*!
 * Anticrm Platform™ Face Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService }): Promise<UIService> => {
  console.log('Plugin `face` started')
  const coreService = deps.core

  // U I  M O D E L S

  async function getClassModel (clazz: Instance<Class<Obj>>): Promise<UIModel> {
    const decorator = await clazz.getSession().as(clazz, ui.class.ClassUIDecorator)
    const label = await decorator.label ?? clazz._id
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
  async function getOwnAttrModel (clazz: Instance<Class<Obj>>, exclude?: string[] | string): Promise<AttrModel[]> {
    const session = clazz.getSession()
    const decorator = await session.as(clazz, ui.class.ClassUIDecorator)
    const keys = Object.getOwnPropertyNames(clazz._attributes).filter(key => !exclude?.includes(key))

    const attributes = clazz._attributes as { [key: string]: Instance<Type<any>> }
    const attrs = keys.map(async (key) => {
      const type = await attributes[key]
      const typeDecorator = await decorator.decorators?.[key]

      const typeClass = await session.getInstance(core.class.Class, type._class)
      const typeClassDecorator = await session.as(typeClass, ui.class.ClassUIDecorator)

      let presenter: AnyComponent | null = null
      const typeClassUIDecorator = await session.as(typeClass, ui.class.TypeClassUIDecorator)
      if (typeClassUIDecorator) {
        if (typeClassUIDecorator.presenter) {
          console.log('TYPE CLASS DECORATOR!!! ', typeClassUIDecorator.presenter)
          presenter = typeClassUIDecorator.presenter
        }
      }

      const label = await typeDecorator?.label ?? await typeClassDecorator?.label ?? key
      const placeholder = (await typeDecorator?.placeholder) ?? label

      const icon = await typeDecorator?.icon ?? await typeClassDecorator?.icon
      return {
        key,
        type,
        label,
        placeholder,
        icon,
        presenter
      } as AttrModel
    })
    return Promise.all(attrs).then(model => model.filter(e => e.type._class !== core.class.Method))
  }

  async function getAttrModel (clazz: Instance<Class<Obj>>, exclude?: string[] | string, top?: Ref<Class<Obj>>): Promise<AttrModel[]> {
    const session = clazz.getSession()
    const hierarchy = session.getClassHierarchy(clazz._id as Ref<Class<Obj>>, top ?? core.class.Doc)
    const ownModels = hierarchy.map(async (_class) => getOwnAttrModel(await session.getInstance(core.class.Class, _class), exclude))
    return Promise.all(ownModels).then(result => result.flat())
  }

  // A D A P T E R S

  async function classToComponent (this: Instance<Adapter>, resource: Resource<any>): Promise<Resource<any>> {
    const session = this.getSession()
    const clazz = await session.getInstance(core.class.Class, resource as Ref<Class<Doc>>)
    if (!session.is(clazz, ui.class.Form)) {
      throw new Error(`something went wrong, can't find 'Form' for the ${resource}.`)
    }
    const component = (await session.as(clazz, ui.class.Form)).form
    return component
  }

  platform.setResource(ui.method.ClassToComponent, classToComponent)

  // S E R V I C E

  return {
    getClassModel,
    getOwnAttrModel,
    getAttrModel,
    groupByType,
  }


}