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

import { plugin, Service, Plugin } from '@anticrm/platform'
import core, { Ref, Class, Doc, Instance } from '@anticrm/platform-core'
import ui, { AnyComponent } from '@anticrm/platform-ui'


export enum ViewModelKind {
  NEW_FORM = 0,
}

export interface ViewModel {
  kind: ViewModelKind
  component: AnyComponent
  object: Doc
}

export interface WorkbenchState {
  mainView: ViewModel | undefined
}

export interface WorkbenchService extends Service {
  getState (): WorkbenchState
}

/**
 * ViewModel describes confguration of a Workbench View
 */
export interface ViewModel extends Doc {
  component: AnyComponent
}

export interface MainModel extends ViewModel {

}

export default plugin('workbench' as Plugin<Service>, {
  core: core.id,
  ui: ui.id,
}, {
  component: {
    Workbench: '' as AnyComponent
  }
})
