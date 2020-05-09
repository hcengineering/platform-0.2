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


import { Doc, Obj } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform'
import { CorePlugin, pluginId as corePluginId } from '@anticrm/platform-core'
import ui, { pluginId, UIPlugin } from '.'

// import { attributeLabelId } from '@anticrm/platform-core/src/utils'

class UIPluginImpl implements UIPlugin {

  readonly pluginId = pluginId
  readonly platform: Platform

  constructor(platform: Platform) {
    this.platform = platform
  }

  getAttrModel(object: Obj, props: string[]) {
    const clazz = object.getClass()
    return props.map(key => ({
      key,
      type: clazz._attributes[key],
      // label: this.translate(attributeLabelId(object._class, key)),
      label: object._class + '.' + key,
      placeholder: 'Placeholder',
    }))
  }
}

export default (platform: Platform): UIPlugin => {
  return new UIPluginImpl(platform)
}
