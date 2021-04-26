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
import { Attribute, Class, Doc, Mixin, Obj, Ref, Type } from '@anticrm/core'
import { VDoc } from '@anticrm/domains'

import core from '@anticrm/platform-core'
import i18n, { IntlString } from '@anticrm/platform-i18n'
import { AnyComponent, Asset, Document } from '@anticrm/platform-ui'

// U I  E X T E N S I O N S

/**
 * Define attribute UI extra properties.
 */
export interface UXAttribute extends Attribute {
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

  color?: Asset // Define a item color if appropriate
}

export interface UXObject<T extends Obj> extends Class<T> {
  label: IntlString
  icon?: Asset
}

// export interface ClassUI<T extends Obj> extends Class<T> {
//   label: IntlString
//   icon?: Asset
// }

/**
 * Define a mixin interface for class with a proposed presenter.
 */
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

/**
 * Definition of class display layout for a class
 */
export interface Viewlet extends Doc {
  displayClass: Ref<Class<Doc>>
  label: IntlString
  icon?: Asset
  component: AnyComponent

  parameters?: Record<string, any> // A set of parameter values for configure particular viewlet.
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

export interface MixinGroupModel extends GroupModel {
  _mixin: Ref<Mixin<Obj>>
}

export interface ClassModel {
  getGroups (): GroupModel[]

  getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined

  getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[] // TODO: why do we have this here, but not within Group?

  getMixins (): MixinGroupModel[]

  getMixin (_mixin: Ref<Mixin<Obj>>): MixinGroupModel | undefined

  getAttributes (): AttrModel[]

  getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined

  filterAttributes (keys: string[]): ClassModel

  getPrimary (): AttrModel | undefined

  filterPrimary (): { model: ClassModel, primary: AttrModel | undefined }
}

export interface CoreDocument extends Document {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
}

// S E R V I C E

export interface PresentationService extends Service {
  getClassModel (_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<ClassModel>

  /**
   * Return a component extension registered for specified class, return undefined if not specified.
   */
  getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): AnyComponent | undefined
}

const presentationPlugin = plugin('presentation' as Plugin<PresentationService>, {
  core: core.id,
  i18n: i18n.id
}, {
  icon: {
    Finder: '' as Asset,
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
  mixin: {
    UXObject: '' as Ref<Mixin<UXObject<Doc>>>,
    UXAttribute: '' as Ref<Mixin<UXAttribute>>,
    Presenter: '' as Ref<Mixin<Presenter<Type>>>,
    DetailForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>,
    CardForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>,

    // Define a form to create a new instance of specified class.
    CreateForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>,
    LookupForm: '' as Ref<Mixin<ComponentExtension<VDoc>>>,
    Viewlet: '' as Ref<Mixin<Viewlet>>
  },
  component: {
    ObjectBrowser: '' as AnyComponent,
    Properties: '' as AnyComponent,
    NumberPresenter: '' as AnyComponent,
    StringPresenter: '' as AnyComponent,
    EnumPresenter: '' as AnyComponent,
    CheckboxPresenter: '' as AnyComponent,
    RefPresenter: '' as AnyComponent,
    TablePresenter: '' as AnyComponent,
    ArrayPresenter: '' as AnyComponent,
    VDocCardPresenter: '' as AnyComponent, // Some default card presenter
    CardPresenter: '' as AnyComponent // Card presenter
  }
})

export default presentationPlugin

export * from './utils'
