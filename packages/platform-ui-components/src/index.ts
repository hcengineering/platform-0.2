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
import core, { Obj, Emb, Ref, Class, Type, Instance } from '@anticrm/platform-core'
import ui from '@anticrm/platform-ui'

export type URL = string
export type Asset = Metadata<URL>

// S T A T E

export const PlatformInjectionKey = Symbol('platform')

export const CoreServiceInjectionKey = Symbol('core-plugin')
export const UIServiceInjectionKey = Symbol('ui-plugin')

/// P L U G I N

export interface UIComponentsService extends Service {
  getApp (): App
}

export default plugin('ui-components' as Plugin<UIComponentsService>, { core: core.id, ui: ui.id }, {
  icon: {
    Default: '' as Asset
  }
})
