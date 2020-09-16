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
import type { UIService } from '.'

import { writable, derived } from 'svelte/store'

import Root from './components/internal/Root.svelte'

/*!
 * Anticrm Platform™ UI Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<UIService> => {

  function createApp (target: HTMLElement) {
    return new Root({ target, props: { platform, ui } })
  }

  function windowLocation () {
    return { pathname: window.location.pathname, search: window.location.search }
  }
  const locationWritable = writable(windowLocation())
  window.addEventListener('popstate', () => {
    locationWritable.set(windowLocation())
  })

  const location = derived(locationWritable, loc => loc)

  function getLocation () {
    return location
  }

  function navigate (url: string) {
    history.pushState(null, '', url)
    locationWritable.set(windowLocation())
  }

  const ui = {
    createApp,
    getLocation,
    navigate,
  }

  return ui

}
