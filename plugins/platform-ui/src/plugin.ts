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

import core, { Obj, Class, Ref, Session, CorePlugin } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform'
import ui, { UIPlugin, AttrModel, ClassUIModel } from '.'
import { I18nPlugin } from '@anticrm/platform-core-i18n'

class UIPluginImpl implements UIPlugin {

  readonly platform: Platform
  readonly i18n: I18nPlugin
  readonly core: CorePlugin
  readonly session: Session

  constructor(platform: Platform, deps: { i18n: I18nPlugin, core: CorePlugin }) {
    this.platform = platform
    this.i18n = deps.i18n
    this.core = deps.core
    this.session = deps.core.getSession()
  }

  async getClassModel(_class: Ref<Class<Obj>>): Promise<ClassUIModel> {
    const clazz = await this.session.getInstance(_class)
    const decorator = await clazz.as(ui.class.ClassUIDecorator)
    const label = decorator?.label ?? _class
    return {
      label,
      icon: decorator?.icon
    }
  }

  getDefaultClassModel(): ClassUIModel {
    return { label: 'The Class' }
  }

  getDefaultAttrModel(props: string[]): AttrModel[] {
    return []
  }

  groupByType(model: AttrModel[]): { [key: string]: AttrModel[] } {
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
      2. Property `Type`'s sythetic id

      3. Property `Type`'s Class UI Decorator `label` attribute
      4. Property `Type`'s Class synthetic id
  */
  async getOwnAttrModel(_class: Ref<Class<Obj>>, props?: string[]): Promise<AttrModel[]> {
    const clazz = await this.session.getInstance(_class)
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

  async getAttrModel(_class: Ref<Class<Obj>>, props?: string[]): Promise<AttrModel[]> {
    // const ownModels = this.getClassHierarchy(_class).map(clazz => this.getOwnAttrModel(clazz, props))
    // return Promise.all(ownModels).then(result => result.flat())
    return {} as Promise<AttrModel[]>
  }

}

console.log('PLUGIN: parsed ui')
export default async (platform: Platform, deps: { i18n: I18nPlugin, core: CorePlugin }) => {
  console.log('PLUGIN: started ui')

  const uiPlugin = new UIPluginImpl(platform, deps)
  return uiPlugin
}
