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
import { getContext } from 'svelte'
import { ApplicationRouter, Location } from './routes'

export type URL = string
export type Asset = Metadata<URL>
export * from './routes'

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
    css: { code: string, map?: string }
    head?: string
  }
}

export type AnySvelteComponent = any // SvelteComponent<{}>

export type Component<C extends AnySvelteComponent> = Resource<C>
export type AnyComponent = Component<AnySvelteComponent>

export const CONTEXT_PLATFORM = 'platform'
export const CONTEXT_PLATFORM_UI = 'platform-ui'

export interface Document { // eslint-disable-line
}

/**
 * Allow to control currently selected document.
 */
export interface DocumentProvider {
  /**
   * Opening a document
   * */
  open: (doc: Document) => Promise<void>

  /**
   * Construct a href with a full URI pointing to required document.
   * @param doc
   */
  getHref: (doc: Document) => Promise<string>

  /**
   * Return currently selected document, if one.
   */
  selection: () => Document | undefined
}

export interface UIService extends Service, DocumentProvider {
  createApp: (root: HTMLElement) => any

  /**
   * Ask UI service to subscribe for browser location changes.
   *
   * @param listener - listener to be notified on location changes, will be triggered for first time on subscribe.
   * @param destroyFactory - a factory to register unsubscribe function to.
   */
  subscribeLocation: (listener: (location: Location) => void, destroyFactory: (op: () => void) => void) => void

  /**
   * Will join a current location with a path, query values or fragment
   * @param path
   * @param query
   * @param fragment
   */
  navigateJoin: (
    path: string[] | undefined,
    query: Record<string, string> | undefined,
    fragment: string | undefined
  ) => void

  /**
   * Navigate to new URL
   * @param newUrl
   */
  navigate: (newUrl: string) => void

  /**
   * Construct a new router to perform operations in component.
   * @param pattern
   * @param matcher
   * @param defaults
   */
  newRouter: <T>(pattern: string, matcher: (match: T) => void, defaults: T | undefined) => ApplicationRouter<T>

  showModal: (component: AnySvelteComponent, props: any, element?: HTMLElement) => void
  closeModal: () => void

  /**
   * Register active document provider.
   * @param provider
   */
  registerDocumentProvider: (provider: DocumentProvider | undefined) => void
}

/**
 * Useful interface to provide action operations.
 */
export interface Action {
  id: string
  name: string // A name to be displayed
  icon?: Asset // An optional icon to be displayed
  action?: () => void // Action to be performed on click
  toggled?: boolean // If passed action item will looks like it is toggled
}

export default plugin(
  'ui' as Plugin<UIService>,
  {},
  {
    metadata: {
      LoginApplication: '' as Metadata<string>,
      DefaultApplication: '' as Metadata<string>
    },
    icon: {
      Default: '' as Asset,
      Error: '' as Asset,
      Network: '' as Asset,
      Search: '' as Asset,
      Add: '' as Asset,
      ArrowDown: '' as Asset,
      Message: '' as Asset,
      Phone: '' as Asset,
      Mail: '' as Asset,
      More: '' as Asset
    },
    component: {
      Icon: '' as AnyComponent,
      Spinner: '' as AnyComponent,
      BadComponent: '' as AnyComponent
    },
    method: {
      AnAction: '' as Resource<(args: any) => void>
    }
  }
)

// U T I L S

export function getPlatform (): Platform {
  return getContext<Platform>(CONTEXT_PLATFORM)
}

export function getUIService (): UIService {
  return getContext<UIService>(CONTEXT_PLATFORM_UI)
}

export function newRouter<T> (
  pattern: string,
  matcher: (match: T) => void,
  defaults: T | undefined = undefined
): ApplicationRouter<T> {
  return getUIService().newRouter(pattern, matcher, defaults)
}
