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

import { App } from 'vue'
import { Property, Resource, Metadata, plugin, Plugin, Service } from '@anticrm/platform'
import core, { Obj, Emb, Ref, Class, Type, Doc, Instance } from '@anticrm/platform-core'
import { IntlString } from '@anticrm/platform-core-i18n'

export type URL = string
export type Asset = Metadata<URL>

export type VueConstructor = object
export type Component<C extends VueConstructor> = Resource<C>
export type AnyComponent = Component<VueConstructor>
export type ComponentRef = Property<AnyComponent>

/// C O R E  M O D E L

export interface UIDecorator { // interface
  label?: IntlString
  icon?: Asset
}

export interface TypeUIDecorator<T> extends Emb, UIDecorator {
  placeholder?: IntlString
}

export interface ClassUIDecorator<T extends Obj> extends Class<T>, UIDecorator {
  decorators?: { [key: string]: TypeUIDecorator<any> }
}

export interface Form<T extends Obj> extends ClassUIDecorator<T> {
  form: ComponentRef
}

// U I  M O D E L

export interface UIModel {
  label: string
  icon?: URL
}

export interface AttrModel extends UIModel {
  key: string
  type: Instance<Type<any>>
  placeholder: string
}


/// P L U G I N

export interface UIService extends Service {
  getClassModel (_class: Ref<Class<Obj>>): Promise<UIModel>
  getOwnAttrModel (_class: Ref<Class<Obj>>, props?: string[]): Promise<AttrModel[]>
  groupByType (model: AttrModel[]): { [key: string]: AttrModel[] }
}

export default plugin('ui' as Plugin<UIService>, { core: core.id }, {
  metadata: {
    DefaultApplication: '' as Metadata<AnyComponent>,
  },
  class: {
    TypeUIDecorator: '' as Ref<Class<TypeUIDecorator<any>>>,
    ClassUIDecorator: '' as Ref<Class<ClassUIDecorator<Obj>>>,
    Form: '' as Ref<Class<Form<Obj>>>
  }
})
