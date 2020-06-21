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
import { Metadata, plugin, Plugin, Service, Platform, PluginDependencies, PluginServices, Resource } from '@anticrm/platform'
import { CoreService, Session } from '@anticrm/platform-core'
import { UIService, AnyComponent } from '@anticrm/platform-ui'

export type URL = string
export type Asset = Metadata<URL>

export const CoreInjectionKey = Symbol('core')
export const UIInjectionKey = Symbol('ui')
export const SessionInjectionKey = Symbol('session')

export function getCoreService () { return inject(CoreInjectionKey) as CoreService }
export function getUIService () { return inject(UIInjectionKey) as UIService }
export function getSession () { return inject(SessionInjectionKey) as Session }

// S T A T E

export const PlatformInjectionKey = Symbol('platform')
export const VueInjectionKey = Symbol('vue')

export function getPlatform () { return inject(PlatformInjectionKey) as Platform }
export function getVueService () { return inject(VueInjectionKey) as VueService }

export async function injectPlatform<D extends PluginDependencies> (deps: D): Promise<{ platform: Platform, deps: PluginServices<D> }> {
  const platform = inject(PlatformInjectionKey) as Platform
  if (!platform) { throw new Error('Platform is not provided.') }
  const resolvedDeps = await platform.resolveDependencies(deps)
  return { platform: platform as Platform, deps: resolvedDeps as PluginServices<D> }
}

/// P L U G I N

/**
 * Navigation (routing) target for a platform application. 
 * It will be encoded as following in the url:
 * 
 * `/app[/path][?{param=value}{&param=value...}]`
 */
export interface LinkTarget {
  path?: string
  app?: AnyComponent
  params?: Record<string, string>
}

export interface VueService extends Service {
  getApp (): App
  getLocation (): LinkTarget
  toUrl (target: LinkTarget): string
  navigate (url: string): void
  back (): void
}

export default plugin('vue' as Plugin<VueService>, {}, {
  icon: {
    Default: '' as Asset
  },
  component: {
    AppLoader: '' as AnyComponent
  },
  method: {
    AnAction: '' as Resource<(args: any) => void>
  }
})
