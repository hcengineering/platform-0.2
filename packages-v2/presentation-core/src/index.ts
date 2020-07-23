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

import { Attribute, Class, Mixin, Obj, Plugin, plugin, Ref, Service, Type, VDoc } from '@anticrm/platform'

import core from '@anticrm/platform-core'
import i18n, { IntlString } from '@anticrm/platform-i18n'
import { AnyComponent, Asset } from '@anticrm/platform-ui'

// U I  E X T E N S I O N S

export interface AttributeUI extends Attribute {
  label: IntlString
  placeholder?: IntlString
  icon?: Asset
}

export interface ClassUI<T extends Obj> extends Class<T> {
  label: IntlString
  icon?: Asset
}

export interface Presenter<T extends Type> extends Class<T> {
  presenter: AnyComponent
}

export interface DetailsForm<T extends VDoc> extends Class<T> {
  form: AnyComponent
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
}

export interface GroupModel extends UIModel {
  _class: Ref<Class<Obj>>
}

export interface ClassModel {
  getGroups(): GroupModel[]
  getGroup(_class: Ref<Class<Obj>>): GroupModel | undefined
  getOwnAttributes(_class: Ref<Class<Obj>>): AttrModel[]
  getAttribute(key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined
  filterAttributes(keys: string[]): ClassModel
}

// S E R V I C E

export interface PresentationCore extends Service {
  getEmptyModel(): ClassModel
  getEmptyAttribute(_class: Ref<Class<Obj>>): AttrModel
  getClassModel(_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<ClassModel>
}

export default plugin('presentation-core' as Plugin<PresentationCore>, { core: core.id, i18n: i18n.id }, {
  class: {
    AttributeUI: '' as Ref<Class<AttributeUI>>,
    ClassUI: '' as Ref<Class<ClassUI<Obj>>>,
    Presenter: '' as Ref<Mixin<Presenter<Type>>>,
    DetailsForm: '' as Ref<Mixin<DetailsForm<VDoc>>>
  }
})
