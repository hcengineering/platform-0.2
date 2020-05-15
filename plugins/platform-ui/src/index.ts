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

import { Metadata, Plugin, PluginId, plugin } from '@anticrm/platform'
import core, { Doc, Emb, Obj, AnyType, Ref, Class, Bag, Type } from '@anticrm/platform-core'
import i18n, { IntlString } from '@anticrm/platform-core-i18n'

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
  decorators?: Bag<TypeUIDecorator>
}

// P L U G I N

export interface AttrModel {
  key: string
  type: AnyType
  label: string
  icon?: Asset
  placeholder: string
}

export interface ClassUIModel {
  label: string
  icon?: Asset
}

export interface UIPlugin extends Plugin {
  getClassModel(clazz: Class<Obj>): ClassUIModel
  getDefaultAttrModel(props: string[]): AttrModel[]
  groupByType(model: AttrModel[]): { [key: string]: AttrModel[] }
  getOwnAttrModel(clazz: Class<Obj>, props?: string[]): Promise<AttrModel[]>
  getAttrModel(clazz: Class<Obj>, props?: string[]): Promise<AttrModel[]>
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
  {
    i18n: i18n.id,
    core: core.id
  },
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
    },
    native: {
      IntlString: '' as Metadata<Type<IntlString>>,
    },
  }
)
