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

import { Metadata, Plugin, PluginId, plugin } from '@anticrm/platform'
import { Doc, Emb, Obj, AnyType, Ref, Class, Bag, } from '@anticrm/platform-core'
import { IntlString } from '@anticrm/platform-core-i18n'

export type Asset = Metadata<string>

// M O D E L

export interface UIDecorator extends Emb {
  label?: IntlString
  icon?: Asset
}

export interface TypeUIDecorator extends UIDecorator {
  placeholder?: IntlString
}

export interface ClassUIDecorator<T extends Obj> extends Class<T> {
  label?: IntlString
  icon?: Asset
  decorators: Bag<TypeUIDecorator>
}

// P L U G I N

export interface AttrModel {
  key: string
  type: AnyType
  label: string
  placeholder: string
}

export interface UIPlugin extends Plugin {
  getDefaultAttrModel(props: string[]): AttrModel[]
  getAttrModel(object: Obj, props: string[]): Promise<AttrModel[]>
}

// D E S C R I P T O R

// export const pluginDescriptor = {
//   id: pluginId,
//   dependencies: {
//     i18n: ''
//   }
// }

export default plugin(
  'ui' as PluginId<UIPlugin>,
  [],
  {
    icon: {
      AddGroup: '' as Asset,
      Add: '' as Asset,
      Checked: '' as Asset,
      Edit: '' as Asset,
      Search: '' as Asset,
    },
    class: {
      ClassUIDecorator: '' as Ref<Class<ClassUIDecorator<Doc>>>
    }
  }
)
