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

import { Metadata, Plugin, plugin, Resource, Service } from '@anticrm/platform'
import { getContext, SvelteComponent } from 'svelte'
import type { Asset } from '@anticrm/status'

export type { Asset }

/**
 * Describe a browser URI location parsed to path, query and fragment.
 */
export interface Location {
  path: string[] // A useful path value
  query: Record<string, string | null> // a value of query parameters, no duplication are supported
  fragment: string // a value of fragment
}

/**
 * Could be registered to provide platform a way to decide about routes from Root component.
 */
export interface ApplicationRouter<T> {
  /**
   * Return parent router if defined.
   */
  parent: () => ApplicationRouter<any> | undefined

  /**
   * Construct a child router based on current matched state
   * Internal child router is just one, and calling twice will replace existing.
   */
  newRouter: <P>(pattern: string) => ApplicationRouter<P>

  /**
   * Will check and match path for registered local routes, if no local routes are match will return false
   */
  match: () => boolean

  /**
   * Return current matched set.
   */
  properties: () => T

  /**
   * Replace defaults passed with constructor, will call matcher function passed with constructor.
   * @param defaults - a new defaults
   */
  setDefaults: (defaults: T) => void

  /**
   * Replace a matcher function passed with constructor.
   * @param matcher
   */
  subscribe: (matcher: (match: T) => void) => void

  // Construct a new navigate using combined query parameters
  queries: (vars: Partial<T>) => Record<string, any> | undefined
  // Construct a current path with all applied variables
  path: (vars: Partial<T>) => string[]
  // Construct a current fragment with app applied variables
  fragment: (vars: Partial<T>) => string | undefined

  /**
   * Construct a full new location based on values of T.
   * Other values will be taken from stored parent and child routers.
   * @param values
   */
  location: (values: Partial<T>) => Location

  /**
   * Use new constructed location value and platform UI to navigate.
   * @param values
   */
  navigate: (values: Partial<T>) => void
}

export type AnySvelteComponent = typeof SvelteComponent

export type Component<C extends AnySvelteComponent> = Resource<C>
export type AnyComponent = Resource<AnySvelteComponent>

export const CONTEXT_PLATFORM = 'platform'
export const CONTEXT_PLATFORM_UI = 'platform-ui'

export interface Document {} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * Allow to control currently selected document.
 */
export interface DocumentProvider {
  /**
   * Opening a document
   * */
  open: (doc: Document) => Promise<void>

  /**
   * Return currently selected document, if one.
   */
  selection: () => Document | undefined
}

export interface UIService extends Service, DocumentProvider {
  createApp: (target: HTMLElement) => SvelteComponent

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
