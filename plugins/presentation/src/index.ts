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

import { Plugin, plugin, Service } from '@anticrm/platform'
import { Attribute, Class, Mixin, Obj, Doc, Ref, Type, VDoc } from '@anticrm/core'

import core from '@anticrm/platform-core'
import i18n, { IntlString } from '@anticrm/platform-i18n'
import { AnyComponent, Asset } from '@anticrm/platform-ui'

// U I  E X T E N S I O N S

export interface AttributeUI extends Attribute {
  label: IntlString
  icon?: Asset
  placeholder?: IntlString
}

export interface UXObject extends Doc {
  label: IntlString
  icon?: Asset
}

// export interface ClassUI<T extends Obj> extends Class<T> {
//   label: IntlString
//   icon?: Asset
// }

export interface Presenter<T extends Type> extends Class<T> {
  presenter: AnyComponent
}

// export interface DetailsForm<T extends VDoc> extends Class<T> {
//   form: AnyComponent
// }

// export interface LookupForm<T extends VDoc> extends Class<T> {
//   form: AnyComponent
// }

export interface ComponentExtension<T extends VDoc> extends Class<T> {
  component: AnyComponent
}

// U I  M O D E L

export interface UIModel {
  label: string
  icon?: Asset
}

export interface AttrModel extends UIModel {
  _class: Ref<Class<Obj>>
  key: string
  presenter: AnyComponent
  placeholder: string
  type: Type
}

export interface GroupModel extends UIModel {
  _class: Ref<Class<Obj>>
}

export interface ClassModel {
  getGroups (): GroupModel[]
  getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined
  getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[]
  getAttributes (): AttrModel[]
  getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined
  filterAttributes (keys: string[]): ClassModel
}

// S E R V I C E

export interface PresentationService extends Service {
  getClassModel (_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<ClassModel>
  getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): AnyComponent
}

export default plugin('presentation' as Plugin<PresentationService>, { core: core.id, i18n: i18n.id }, {
  class: {
    AttributeUI: '' as Ref<Class<AttributeUI>>,
    Presenter: '' as Ref<Mixin<Presenter<Type>>>,
    DetailForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>,
    LookupForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>
  },
  mixin: {
    UXObject: '' as Ref<Mixin<UXObject>>
  },
  component: {
    ObjectBrowser: '' as AnyComponent,
    NumberPresenter: '' as AnyComponent,
    StringPresenter: '' as AnyComponent,
    RefPresenter: '' as AnyComponent
  }
})