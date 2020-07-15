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

import { Attribute, Class, Obj, Plugin, plugin, Ref, Service, Type } from '@anticrm/platform'

import core from '@anticrm/platform-core'
import i18n, { IntlString } from '@anticrm/platform-i18n'
import { Asset } from '@anticrm/platform-ui'

// U I  E X T E N S I O N S

export interface AttributeUI extends Attribute {
  label: IntlString
  placeholder?: IntlString
  icon?: Asset
}

// U I  M O D E L

export interface UIModel {
  label: string
  icon?: Asset
}

export interface AttrModel extends UIModel {
  key: string
  type: Type
  placeholder: string
}

export interface PresentationCore extends Service {

  getAttrModel(_class: Ref<Class<Obj>>): Promise<AttrModel[]>
}

export default plugin('presentation-core' as Plugin<PresentationCore>, { core: core.id, i18n: i18n.id }, {
  class: {
    AttributeUI: '' as Ref<Class<AttributeUI>>
  }
})
