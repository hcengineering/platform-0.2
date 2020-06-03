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

import { App, inject } from 'vue'
import { Metadata, plugin, Plugin, Service, Platform, PluginDependencies, InferPlugins } from '@anticrm/platform'
import { AnyComponent } from '@anticrm/platform-ui'

export type URL = string
export type Asset = Metadata<URL>

// S T A T E

export const PlatformInjectionKey = Symbol('platform')
export const UIComponentsInjectionKey = Symbol('ui-components')

export async function injectPlatform<D extends PluginDependencies> (deps: D): Promise<{ platform: Platform, deps: InferPlugins<D> }> {
  const platform = inject(PlatformInjectionKey) as Platform
  if (!platform) { throw new Error('Platform is not provided.') }
  const resolvedDeps = await platform.resolveDependencies(deps)
  return { platform: platform as Platform, deps: resolvedDeps as InferPlugins<D> }
}

/// P L U G I N

export interface LinkTarget {
  path: string
  app?: AnyComponent
}

export interface UIComponentsService extends Service {
  getApp (): App
  getLocation (): LinkTarget
  navigate (target: LinkTarget): void
}

export default plugin('ui-components' as Plugin<UIComponentsService>, {}, {
  icon: {
    Default: '' as Asset
  }
})
