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

import { Metadata, Platform, Plugin, plugin, Resource, Service } from '@anticrm/platform'
import { getContext, onDestroy, setContext } from 'svelte'
import core, { CoreService } from '@anticrm/platform-core'
import { ApplicationRoute, ApplicationRouter, Location, Router } from './routes'

export type URL = string
export type Asset = Metadata<URL>
export { Location, ApplicationRoute }

// export type SvelteConstructor = object

interface ComponentOptions<Props> {
  target: HTMLElement
  anchor?: HTMLElement
  props?: Props
  hydrate?: boolean
  intro?: boolean
}

export interface SvelteComponent<Props> {
  new (options: ComponentOptions<Props>): any

  // eslint-disable-next-line @typescript-eslint/ban-types
  $set: (props: {}) => any
  $on: (event: string, callback: (event: CustomEvent) => any) => any
  $destroy: () => any
  // eslint-disable-next-line @typescript-eslint/ban-types
  render: (props?: {}) => {
    html: string
    css: { code: string; map?: string }
    head?: string
  }
}

export type AnySvelteComponent = any // SvelteComponent<{}>

export type Component<C extends AnySvelteComponent> = Resource<C>
export type AnyComponent = Component<AnySvelteComponent>

export const CONTEXT_PLATFORM = 'platform'
export const CONTEXT_PLATFORM_UI = 'platform-ui'

export interface UIService extends Service {
  createApp (root: HTMLElement): any

  subscribeLocation (listener: (location: Location) => void, destroyFactory: (op: () => void) => void): void

  /**
   * Will join a current location with a path, query values or fragment
   * @param path
   * @param query
   * @param fragment
   */
  navigateJoin (path: string[] | undefined, query: Record<string, string> | undefined, fragment: string | undefined): void

  /**
   * Navigate to full location
   * @param location
   */
  navigate (location: Location): void

  showModal (component: AnySvelteComponent, props: any, element?: HTMLElement): void
  closeModal (): void
}

/**
 * Useful interface to provide action operations.
 */
export interface Action {
  name: string // A name to be displayed
  icon?: Asset // An optional icon to be displayed
  action?: () => void // Action to be performed on click
  toggled?: boolean // If passed action item will looks like it is toggled
}

export default plugin('ui' as Plugin<UIService>, {}, {
  metadata: {
    LoginApplication: '' as Metadata<ApplicationRoute>,
    DefaultApplication: '' as Metadata<ApplicationRoute>
  },
  icon: {
    Default: '' as Asset,
    Error: '' as Asset,
    Network: '' as Asset,
    Search: '' as Asset,
    Add: '' as Asset,
    ArrowDown: '' as Asset
  },
  component: {
    Icon: '' as AnyComponent,
    Spinner: '' as AnyComponent,
    BadComponent: '' as AnyComponent
  },
  method: {
    AnAction: '' as Resource<(args: any) => void>
  }
})

// U T I L S

export function getPlatform (): Platform {
  return getContext(CONTEXT_PLATFORM) as Platform
}

export function getCoreService (): CoreService {
  return getPlatform().getRunningPlugin(core.id) as CoreService
}

export function getUIService (): UIService {
  return getContext(CONTEXT_PLATFORM_UI) as UIService
}

const CONTEXT_ROUTE_VALUE = 'routes.context'
export function newRouter<T> (pattern: string, matcher: (match: T) => void, defaults: T | undefined = undefined): ApplicationRouter<T> {
  const r = getContext(CONTEXT_ROUTE_VALUE) as Router<any>
  const result = r ? r.newRouter<T>(pattern, defaults) : new Router<T>(pattern, r, defaults)
  result.subscribe(matcher)
  if (!r) {
    // No parent, we need to subscribe for location changes.
    getUIService().subscribeLocation((loc) => {
      result.update(loc)
    }, onDestroy)
  }
  setContext(CONTEXT_ROUTE_VALUE, result)
  return result
}
