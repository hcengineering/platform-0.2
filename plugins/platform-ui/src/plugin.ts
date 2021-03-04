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

import type { Platform } from '@anticrm/platform'
import type { AnySvelteComponent, Location, UIService } from '.'
import ui from '.'

import { derived, Readable, writable } from 'svelte/store'

import Root from './components/internal/Root.svelte'

import { store } from './stores'

import Spinner from './components/internal/Spinner.svelte'
import Icon from './components/Icon.svelte'
import { locationToUrl, parseLocation } from './location'

/*!
 * Anticrm Platform™ UI Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<UIService> => {
  platform.setResource(ui.component.Icon, Icon)
  platform.setResource(ui.component.Spinner, Spinner)

  function createApp (target: HTMLElement) {
    return new Root({ target, props: { platform, ui: uiService } })
  }

  function windowLocation (): Location {
    return parseLocation(window.location)
  }

  const locationWritable = writable(windowLocation())
  window.addEventListener('popstate', () => {
    locationWritable.set(windowLocation())
  })

  const location: Readable<Location> = derived(locationWritable, loc => loc)

  function subscribeLocation (listener: (location: Location) => void, destroyFactory: (op: () => void) => void): void {
    const unsubscribe = location.subscribe((location) => {
      listener(location)
    })
    destroyFactory(unsubscribe)
  }

  function navigate (location: Location) {
    const newUrl = locationToUrl(location)
    const curUrl = locationToUrl(windowLocation())
    if (curUrl === newUrl) {
      return
    }
    history.pushState(null, '', newUrl)
    locationWritable.set(windowLocation())
  }

  function navigateJoin (path: string[] | undefined, query: Record<string, string> | undefined, fragment: string | undefined) {
    const newLocation = windowLocation()
    if (path) {
      newLocation.path = path
    }
    if (query) {
      // For query we do replace
      const currentQuery = newLocation.query || {}
      for (const kv of Object.entries(query)) {
        currentQuery[kv[0]] = kv[1]
      }
    }
    if (fragment) {
      newLocation.fragment = fragment
    }
    navigate(newLocation)
  }

  function showModal (component: AnySvelteComponent, props: any, element?: HTMLElement) {
    store.set({ is: component, props, element: element })
  }

  function closeModal () {
    store.set({ is: undefined, props: {}, element: undefined })
  }

  const uiService = {
    createApp,
    subscribeLocation,
    navigateJoin,
    navigate,
    showModal,
    closeModal
  } as UIService

  return uiService
}
