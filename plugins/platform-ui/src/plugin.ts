//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import Vue from 'vue'

import { Doc, Obj, Type, PropertyType, Class, Ref, Session } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform'
import ui, { UIPlugin, AttrModel, UIDecorator, ClassUIDecorator, ClassUIModel } from '.'
import i18n, { I18nPlugin, IntlString } from '@anticrm/platform-core-i18n'

export function synthIntlStringId(clazz: Ref<Class<Obj>>, propertyKey: string, attribute?: string): IntlString {
  return (attribute ? clazz + '.' + attribute + '_' + propertyKey : clazz + '_' + propertyKey) as IntlString
}

class UIPluginImpl implements UIPlugin {

  readonly pluginId = ui.id
  readonly platform: Platform

  readonly i18n: I18nPlugin

  constructor(platform: Platform) {
    this.platform = platform
    this.i18n = platform.getPlugin(i18n.id)
  }

  getClassModel(clazz: Class<Obj>): ClassUIModel {
    const decorator = clazz.as(ui.class.ClassUIDecorator)
    const label = decorator?.label ?? synthIntlStringId(clazz._id, 'label')
    return {
      label: this.i18n.translate(label) ?? label,
      icon: decorator?.icon
    }
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
  async getAttrModel(clazz: Class<Obj>, object: Obj, props?: string[]): Promise<AttrModel[]> {
    //const clazz = object.getClass()
    const decorator = clazz.as(ui.class.ClassUIDecorator)
    const keys = props ?? Object.getOwnPropertyNames(clazz._attributes)

    return keys.map(key => {
      const type = clazz._attributes[key]
      const typeDecorator = decorator?.decorators?.[key]
      const typeClass = type.getClass()
      const typeClassDecorator = typeClass.as(ui.class.ClassUIDecorator)

      const l1 = typeDecorator?.label ?? synthIntlStringId(clazz._id, 'label', key)
      const l2 = typeClassDecorator?.label ?? synthIntlStringId(typeClass._id, 'label')
      const label = this.i18n.translate(l1) ?? this.i18n.translate(l2) ?? key

      const p1 = typeDecorator?.placeholder ?? synthIntlStringId(clazz._id, 'placeholder', key)
      const p2 = synthIntlStringId(typeClass._id, 'placeholder')
      const placeholder = this.i18n.translate(p1) ?? this.i18n.translate(p2) ?? key

      const icon = typeDecorator?.icon ?? typeClassDecorator?.icon
      return {
        key,
        type: clazz._attributes[key],
        label,
        placeholder,
        icon
      }
    })
  }
}

export default (platform: Platform): UIPlugin => {

  abstract class TIntlString implements Type<IntlString> {
    _class!: Ref<Class<this>>
    abstract getSession(): Session
    abstract getClass(): Class<this>
    abstract toIntlString(plural?: number | undefined): string

    exert(value: IntlString, target?: PropertyType, key?: PropertyKey): any {
      // console.log('TIntlString.exert')
      // console.log(target)
      // console.log(key)
      return value
    }
    hibernate(value: any): IntlString { return value }
  }

  platform.setMetadata(ui.native.IntlString, TIntlString.prototype)

  const uiPlugin = new UIPluginImpl(platform)
  Vue.prototype.$uiPlugin = uiPlugin
  return uiPlugin
}
