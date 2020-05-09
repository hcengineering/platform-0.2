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

import { Doc, Obj, Type, PropertyType, Class } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform'
import { CorePlugin, pluginId as corePluginId } from '@anticrm/platform-core'
import ui, { UIPlugin, AttrModel } from '.'
import { IntlString } from '@anticrm/platform-core-i18n'

class UIPluginImpl implements UIPlugin {

  readonly pluginId = ui.id
  readonly platform: Platform

  constructor(platform: Platform) {
    this.platform = platform
  }

  getDefaultAttrModel(props: string[]): AttrModel[] {
    return []
  }

  /** 
    Here is a summary on an attribute label search order
      1. Type's UI Decorator `label` attribute
      2. If (1) missed, construct IntlString Id synthetically
  */
  async getAttrModel(object: Obj, props: string[]): Promise<AttrModel[]> {
    const clazz = object.getClass()
    return props.map(key => {
      const decorator = clazz.as(ui.class.ClassUIDecorator)
      const type = decorator?.decorators[key]
      const label = type?.label ?? clazz._id + '_' + key as IntlString
      const placeholder = type?.placeholder ?? 'Placeholder'
      return {
        key,
        type: clazz._attributes[key],
        label,
        placeholder
      }
    })
  }
}

export default (platform: Platform): UIPlugin => {
  const uiPlugin = new UIPluginImpl(platform)
  Vue.prototype.$uiPlugin = uiPlugin
  return uiPlugin
}
