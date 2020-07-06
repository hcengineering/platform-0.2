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

import { inject } from 'vue'
import { plugin, Service, Plugin, Resource, Metadata } from '@anticrm/platform'
import core, { Ref, Class, Doc, CoreService, Property, Session } from '@anticrm/platform-core'
import ui, { AnyComponent, UIService } from '@anticrm/platform-ui'
import vue, { Asset } from '@anticrm/platform-vue'
import i18n from '@anticrm/platform-core-i18n'
import { CoreInjectionKey, UIInjectionKey, SessionInjectionKey } from '@anticrm/platform-vue'

// C O R E  M O D E L

export interface DocCreateAction extends Doc {
  clazz: Ref<Class<Doc>>
  action?: Property<() => void>
}

// U I  M O D E L

export enum ViewModelKind {
  NEW_FORM = 0,
}

/**
 * ViewModel describes confguration of a Workbench View
 */
export interface ViewModel {
  kind: ViewModelKind
  component: AnyComponent
  content: Doc
}

// S E R V I C E

export interface WorkbenchService extends Service {
  // getViewModel (_class: Ref<Class<Doc>>, kind: ViewModelKind): Promise<ViewModel>
}

export interface MainModel extends ViewModel {

}

export default plugin('workbench' as Plugin<WorkbenchService>, {
  core: core.id,
  i18n: i18n.id,
  ui: ui.id,
  vue: vue.id
}, {
  metadata: {
    ServerUrl: '' as Metadata<string>
  },
  icon: {
    NewItem: '' as Asset
  },
  class: {
    DocCreateAction: '' as Ref<Class<DocCreateAction>>
  },
  component: {
    Workbench: '' as AnyComponent
  },
  method: {
    Logout: '' as Resource<() => void>
  }
})
