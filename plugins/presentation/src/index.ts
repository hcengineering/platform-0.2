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

import { Platform, Plugin, plugin, Service } from '@anticrm/platform'
import { Class, Mixin, Obj, Doc, Ref, Type, Emb } from '@anticrm/model'

import core from '@anticrm/platform-core'
import i18n, { IntlString } from '@anticrm/platform-i18n'
import { AnyComponent, Asset, CONTEXT_PLATFORM } from '@anticrm/platform-ui'
import { VDoc } from '@anticrm/core'
import { getContext } from 'svelte'

// U I  E X T E N S I O N S

/**
 * Define attribute UI extra properties.
 */
export interface UXAttribute extends Emb {
  // Declare label
  label: IntlString

  // Declare an icon
  icon?: Asset

  // Declare a placeholder
  placeholder?: IntlString

  // Declare if field should be not visible
  visible?: boolean

  // Declare a direct presenter for field
  presenter?: AnyComponent
}

export interface UXObject<T extends Obj> extends Mixin<T> {
  label: IntlString
  icon?: Asset

  attributes: Record<string, UXAttribute>
}

// export interface ClassUI<T extends Obj> extends Class<T> {
//   label: IntlString
//   icon?: Asset
// }

/**
 * Define a mixin interface for class with a proposed presenter.
 */
export interface Presenter<T extends Type> extends Mixin<T> {
  presenter: AnyComponent
}

// export interface DetailsForm<T extends VDoc> extends Class<T> {
//   form: AnyComponent
// }

// export interface LookupForm<T extends VDoc> extends Class<T> {
//   form: AnyComponent
// }

export interface ComponentExtension<T extends VDoc> extends Mixin<T> {
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
  primary: boolean
}

export interface GroupModel extends UIModel {
  _class: Ref<Class<Obj>>
}

export interface ClassModel {
  getGroups (): GroupModel[]

  getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined

  getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[] // TODO: why do we have this here, but not within Group?
  getAttributes (): AttrModel[]

  getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined

  filterAttributes (keys: string[]): ClassModel

  getPrimary (): AttrModel | undefined

  filterPrimary (): { model: ClassModel, primary: AttrModel | undefined }
}

// S E R V I C E

export interface PresentationService extends Service {
  getClassModel (_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<ClassModel>

  getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): AnyComponent
}

const presentationPlugin = plugin('presentation' as Plugin<PresentationService>, {
  core: core.id,
  i18n: i18n.id
}, {
  icon: {
    brdBold: '' as Asset,
    brdItalic: '' as Asset,
    brdUnder: '' as Asset,
    brdStrike: '' as Asset,
    brdCode: '' as Asset,
    brdUL: '' as Asset,
    brdOL: '' as Asset,
    brdLink: '' as Asset,
    brdAddr: '' as Asset,
    brdClip: '' as Asset,
    brdSend: '' as Asset,
    brdSmile: '' as Asset
  },
  class: {
    UXAttribute: '' as Ref<Class<UXAttribute>>,
    Presenter: '' as Ref<Mixin<Presenter<Type>>>,
    DetailForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>,
    LookupForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>
  },
  mixin: {
    UXObject: '' as Ref<Mixin<UXObject<Doc>>>
  },
  component: {
    ObjectBrowser: '' as AnyComponent,
    Properties: '' as AnyComponent,
    NumberPresenter: '' as AnyComponent,
    StringPresenter: '' as AnyComponent,
    CheckboxPresenter: '' as AnyComponent,
    RefPresenter: '' as AnyComponent
  }
})

export default presentationPlugin

export function getPresentationService (): Promise<PresentationService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(presentationPlugin.id)
}
