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

import type { Platform } from '@anticrm/plugin'
import type { AnySvelteComponent, DocumentProvider, Location, UIService } from '@anticrm/plugin-ui'
import ui, { ApplicationRouter, Document } from '@anticrm/plugin-ui'

import { derived, Readable, writable } from 'svelte/store'

// import Root from './components/internal/Root.svelte'

import Root from './components/Root.svelte'

import { store } from './stores'

// import Spinner from './components/internal/Spinner.svelte'
// import Icon from './components/Icon.svelte'
import { locationToUrl, parseLocation } from './location'
import { Router } from './routes'
import { SvelteComponent, getContext, onDestroy, setContext } from 'svelte'

/*!
 * Anticrm Platform™ UI Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<UIService> => {
  // platform.setResource(ui.component.Icon, Icon)
  // platform.setResource(ui.component.Spinner, Spinner)

  function createApp (target: HTMLElement): SvelteComponent {
    return new Root ({ target, props: { platform, ui: uiService } })
  }

  function windowLocation (): Location {
    return parseLocation(window.location)
  }

  const locationWritable = writable(windowLocation())
  window.addEventListener('popstate', () => {
    locationWritable.set(windowLocation())
  })

  const location: Readable<Location> = derived(locationWritable, (loc) => loc)

  function subscribeLocation (listener: (location: Location) => void, destroyFactory: (op: () => void) => void): void {
    const unsubscribe = location.subscribe((location) => {
      listener(location)
    })
    destroyFactory(unsubscribe)
  }

  function navigate (newUrl: string): void {
    const curUrl = locationToUrl(windowLocation())
    if (curUrl === newUrl) {
      return
    }
    history.pushState(null, '', newUrl)
    locationWritable.set(windowLocation())
  }

  function navigateJoin (
    path: string[] | undefined,
    query: Record<string, string> | undefined,
    fragment: string | undefined
  ): void {
    const newLocation = windowLocation()
    if (path != null) {
      newLocation.path = path
    }
    if (query != null) {
      // For query we do replace
      const currentQuery = newLocation.query || {}
      for (const kv of Object.entries(query)) {
        currentQuery[kv[0]] = kv[1]
      }
    }
    if (fragment) {
      newLocation.fragment = fragment
    }
    navigate(locationToUrl(newLocation))
  }

  function showModal (component: AnySvelteComponent, props: any, element?: HTMLElement): void {
    store.set({ is: component, props, element: element })
  }

  function closeModal (): void {
    store.set({ is: undefined, props: {}, element: undefined })
  }

  const CONTEXT_ROUTE_VALUE = 'routes.context'

  function newRouter<T> (
    pattern: string,
    matcher: (match: T) => void,
    defaults: T | undefined = undefined
  ): ApplicationRouter<T> {
    const r: Router<any> = getContext(CONTEXT_ROUTE_VALUE)
    const navigateOp = (loc: Location): void => {
      navigate(locationToUrl(loc))
    }
    const result = r ? r.newRouter<T>(pattern, defaults) : new Router<T>(pattern, r, defaults, navigateOp)
    result.subscribe(matcher)
    if (!r) {
      // No parent, we need to subscribe for location changes.
      uiService.subscribeLocation((loc) => {
        result.update(loc)
      }, onDestroy)
    }
    if (r) {
      // We need to remove child router from parent, if component is destroyed
      onDestroy(() => r.clearChildRouter())
    }
    setContext(CONTEXT_ROUTE_VALUE, result)
    return result
  }

  let documentProvider: DocumentProvider | undefined

  async function open (doc: Document): Promise<void> {
    if (documentProvider != null) {
      return await documentProvider.open(doc)
    }
    return await Promise.reject(new Error('Document provider is not registred'))
  }

  function selection (): Document | undefined {
    if (documentProvider != null) {
      return documentProvider.selection()
    }
    return undefined
  }

  function registerDocumentProvider (provider: DocumentProvider): void {
    documentProvider = provider
  }

  const uiService = {
    createApp,
    subscribeLocation,
    navigateJoin,
    navigate,
    newRouter,
    showModal,
    closeModal,

    open,
    selection,
    registerDocumentProvider
  } as UIService

  return Promise.resolve(uiService)
}
