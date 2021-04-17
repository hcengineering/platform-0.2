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

import { Metadata, plugin, Plugin, Service } from '@anticrm/platform'

import core from '@anticrm/platform-core'
import ui, { AnyComponent, Asset } from '@anticrm/platform-ui'
import { IntlString } from '@anticrm/platform-i18n'
import { Class, Doc, Ref } from '@anticrm/core'
import { Application, Space, VDoc } from '@anticrm/domains'

export interface Perspective extends Doc {
  name: string // A uniq short name
  label: IntlString
  icon?: Asset
  component: AnyComponent
}

export interface WorkbenchApplication extends Application {
  route: string // An application route segment, will be applied after global route
  label: IntlString
  icon?: Asset
  rootComponent?: AnyComponent // A component to be shown if application itself is selected.
  component?: AnyComponent // A component to be shown in generic application.
  classes: Ref<Class<VDoc>>[]

  supportSpaces: boolean // If set to true, application will support spaces.
  spaceTitle?: string // A title for show spaces as
  spaceComponent?: AnyComponent // If defined will show component for space selection, instead of default one.

  spaceFilter?: Metadata<SpaceFilter> // An override for spaces list.
}

export interface ItemCreator extends Doc {
  name: IntlString
  class: Ref<Class<VDoc>>
  app: Ref<WorkbenchApplication>
  component?: AnyComponent
}

/**
 * A space filtering mechanism, it should be mixed to application with
 */
export interface SpaceFilter {
  filter (spaces: Space[], application: WorkbenchApplication): Space[]
}

export interface WorkbenchService extends Service {
}

export default plugin('workbench' as Plugin<WorkbenchService>, {
  core: core.id,
  ui: ui.id
}, {
  icon: {
    DefaultPerspective: '' as Asset,
    Add: '' as Asset,
    Resize: '' as Asset,
    Close: '' as Asset,
    Finder: '' as Asset,
    Lock: '' as Asset,
    Sharp: '' as Asset,
    Burger: '' as Asset,
    ArrowDown: '' as Asset,
    ArrowRight: '' as Asset
  },
  component: {
    Workbench: '' as AnyComponent,
    DefaultPerspective: '' as AnyComponent,
    CreateSpace: '' as AnyComponent,
    JoinSpace: '' as AnyComponent,
    BrowseSpace: '' as AnyComponent,
    Application: '' as AnyComponent,
    ApplicationDashboard: '' as AnyComponent,
    CreateForm: '' as AnyComponent,

    // A table presentation layout
    TableLayout: '' as AnyComponent,
    // A card line display layout
    CardLayout: '' as AnyComponent,

    SpacePresenter: '' as AnyComponent
  },
  class: {
    Perspective: '' as Ref<Class<Perspective>>,
    WorkbenchApplication: '' as Ref<Class<WorkbenchApplication>>,
    ItemCreator: '' as Ref<Class<ItemCreator>>
  },
  perspective: {
    Default: '' as Ref<Perspective>
  }
})
