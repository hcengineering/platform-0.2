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

import { Platform } from '@anticrm/platform'
import ui, { AnyComponent } from '@anticrm/platform-ui'
import vue, { VueService, PlatformInjectionKey, VueInjectionKey, LinkTarget } from '.'
import { h, ref, PropType, createApp, defineComponent } from 'vue'

import Root from './internal/Root.vue'
import AppLoader from './internal/AppLoader.vue'

console.log('Plugin `ui` loaded')
/*!
 * Anticrm Platform™ Vue Components Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<VueService> => {
  console.log('Plugin `ui` started')

  // V U E  A P P

  const app = createApp(Root)
    .provide(PlatformInjectionKey, platform)

  app.config.globalProperties.$platform = platform

  // C O M P O N E N T  R E N D E R E R

  platform.setResource(vue.component.AppLoader, AppLoader)

  app.component('widget', defineComponent({
    props: {
      component: String as unknown as PropType<AnyComponent>,
      fallback: String as unknown as PropType<AnyComponent>
    },
    setup () {
      return {
        resolved: ref(''),
      }
    },
    render () {
      const cached = platform.peekResource(this.component as AnyComponent)
      if (cached) {
        return h(cached)
      }
      if (this.component !== this.resolved) {
        platform.resolve(this.component as AnyComponent).then(resolved => {
          this.resolved = this.component
        })

        const fallback = platform.peekResource(this.fallback as AnyComponent)
        if (fallback) {
          return h(fallback)
        } else {
          return h('div', [])
        }
      } else {
        const resolved = platform.peekResource(this.resolved as AnyComponent)
        if (resolved) {
          return h(resolved)
        } else {
          return h('div', [])
        }
      }
    }
  }))

  // R O U T I N G

  function currentLocation () { return window.location.pathname + window.location.search }
  const location = ref(currentLocation())

  const onStateChange = () => { location.value = currentLocation() }
  window.addEventListener('popstate', onStateChange)

  function getLocation () {
    const loc = location.value
    const index = loc.indexOf('?')
    const pathname = (index === -1) ? loc : loc.substring(0, index)
    const search = (index === -1) ? '' : loc.substring(index + 1)

    const split = pathname.split('/')

    console.log(split)

    const app = split[1].length === 0 ? platform.getMetadata(ui.metadata.DefaultApplication) as AnyComponent : split[1] as AnyComponent
    const path = split.splice(2).join('/')

    const params = {} as Record<string, string>
    const searchParams = search.split('&')
    for (const param of searchParams) {
      const [key, value] = param.split('=')
      params[key] = value
    }

    return { app, path, params }
  }

  function toUrl (target: LinkTarget) {
    let paramCount = 0
    let params = ''
    for (const key in target.params) {
      params += paramCount === 0 ? '?' : '&'
      params += key + '=' + target.params[key]
    }

    return '/' + target.app +
      (target.path ? '/' + target.path : '') +
      params
  }

  function navigate (target: LinkTarget) {
    console.log('navigate: ')
    console.log(target)

    const current = getLocation()
    if (target.app) { current.app = target.app }
    if (target.path) { current.path = target.path }

    if (!current.params) { current.params = {} }
    for (const key in target.params) {
      current.params[key] = target.params[key]
    }

    const url = toUrl(current)
    if (url !== location.value) {
      console.log('pushstate: ' + url)
      history.pushState(null, '', url)
      location.value = url
    }
  }


  // S E R V I C E

  const service = {
    getApp () { return app },
    getLocation,
    navigate,
  }

  app.provide(VueInjectionKey, service)
  return service

}
