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

import { identify, Metadata, Plugin, PluginId } from '@anticrm/platform'
import { Doc, Obj, AnyType, Ref, Class } from '@anticrm/platform-core'

export type Asset = Metadata<string>

/////

export interface UIDecorator extends Doc {
  icon: Asset
}

/////

export interface AttrModel {
  key: string
  type: AnyType
  label: string
  placeholder: string
}

export interface UIPlugin extends Plugin {
  loadModel(docs: Doc[]): void

  getAttrModel(object: Obj, props: string[]): AttrModel[]
}

export const pluginId = 'ui' as PluginId<UIPlugin>

const ui = identify(pluginId, {
  icon: {
    AddGroup: '' as Asset,
    Add: '' as Asset,
    Checked: '' as Asset,
    Edit: '' as Asset,
    Search: '' as Asset,
  },
  mixin: {
    UIDecorator: '' as Ref<Class<UIDecorator>>
  }
})

export default ui
