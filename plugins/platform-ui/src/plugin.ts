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

import { Obj, Class, Ref, CorePlugin } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform'
import ui, { UIPlugin, AttrModel, ClassUIModel, VueConstructor, AnyComponent } from '.'

import { createApp } from 'vue'
import Desktop from './components/Desktop.vue'

console.log('PLUGIN: ui loaded')

/*!
 * Anticrm Platform™ UI Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CorePlugin }): Promise<UIPlugin> => {
  console.log('PLUGIN: ui started')

  const core = deps.core
  const session = deps.core.getSession()

  // V U E  A P P

  const app = createApp(Desktop)
  app.config.globalProperties.$platform = platform

  // C O M P O N E N T S

  const components = new Map<AnyComponent, VueConstructor>()

  function getComponent (id: AnyComponent): VueConstructor {
    const result = components.get(id)
    if (result) {
      return result
    }
    throw new Error('no Vue component: ' + id)
  }

  app.component('widget', {
    components: {},
    props: {
      component: String // as PropType<Component<VueConstructor>>
    },
    render (h: any) {
      return h(getComponent(this.component as AnyComponent))
    }
  })

  // U I  M O D E L S

  async function getClassModel (_class: Ref<Class<Obj>>): Promise<ClassUIModel> {
    const clazz = await session.getInstance(_class)
    const decorator = await clazz.as(ui.class.ClassUIDecorator)
    const label = decorator?.label ?? _class
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
  async function getOwnAttrModel (_class: Ref<Class<Obj>>, props?: string[]): Promise<AttrModel[]> {
    const clazz = await session.getInstance(_class)
    const decorator = await clazz.as(ui.class.ClassUIDecorator)
    const keys = props ?? Object.getOwnPropertyNames(clazz._attributes)

    const attrs = keys.map(async (key) => {
      const type = clazz._attributes[key]
      const typeDecorator = decorator?.decorators?.[key]

      const typeClass = type.getClass()
      const typeClassDecorator = await typeClass.as(ui.class.ClassUIDecorator)

      const label = typeDecorator?.label ?? typeClassDecorator?.label ?? key
      const placeholder = typeDecorator?.placeholder ?? label

      const icon = typeDecorator?.icon ?? typeClassDecorator?.icon
      return {
        key,
        type,
        label,
        placeholder,
        icon
      }
    })
    return Promise.all(attrs)
  }

  async function getAttrModel (_class: Ref<Class<Obj>>, props?: string[]): Promise<AttrModel[]> {
    const hierarchy = await core.getClassHierarchy(_class)
    const ownModels = hierarchy.map(clazz => getOwnAttrModel(clazz, props))
    return Promise.all(ownModels).then(result => result.flat())
  }

  // R E G I S T E R  C O M P O N E N T S

  // components.set(ui.component.Icon, Icon)

  return {
    getClassModel,
    groupByType,
    getOwnAttrModel,
    getAttrModel,
    getApp () { return app }
  }
}
