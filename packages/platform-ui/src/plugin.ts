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
import { Location, PlatformInjectionKey, UIInjectionKey, UIService } from '.'
import { createApp, defineComponent, h, PropType, ref } from 'vue'

import Root from './components/Root.vue'
import Spinner from './components/Spinner.vue'
import BadComponent from './components/BadComponent.vue'

/*!
 * Anticrm Platform™ UI Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<UIService> => {
  // V U E  A P P

  const app = createApp(Root)
    .provide(PlatformInjectionKey, platform)

  app.config.globalProperties.$platform = platform

  // C O M P O N E N T  R E N D E R E R

  const BAD_COMPONENT = 'bad_component' as AnyComponent

  app.component('widget', defineComponent({
    props: {
      component: {
        type: String as unknown as PropType<AnyComponent>,
        required: true
      },
      fallback: String as unknown as PropType<AnyComponent>
    },
    setup (props, context) {
      const resolved = ref('' as AnyComponent)

      return () => {
        const resolvedComponent = platform.peekResource(props.component as AnyComponent)
        if (resolvedComponent) {
          return h(resolvedComponent, context.attrs)
        }
        if (resolved.value === BAD_COMPONENT) {
          return h(BadComponent)
        }
        if (props.component !== resolved.value) {
          platform.getResource(props.component as AnyComponent).then(() => {
            resolved.value = props.component as AnyComponent
          }).catch(err => {
            platform.setPlatformStatus(err)
            resolved.value = BAD_COMPONENT
          })
          const fallback = platform.peekResource(props.fallback as AnyComponent)
          if (fallback) {
            return h(fallback)
          } else {
            return h('div', [])
          }
        } else {
          const resolvedComponent = platform.peekResource(resolved.value as AnyComponent)
          if (resolvedComponent) {
            return h(resolvedComponent, context.attrs)
          } else {
            return h('div', [])
          }
        }
      }
    }
  }))

  // R O U T I N G

  function windowLocation () {
    return window.location.pathname + window.location.search
  }

  const location = ref(windowLocation())

  window.addEventListener('popstate', () => {
    location.value = windowLocation()
  })

  /**
   * Navigate to given url
   * @param url
   */
  function navigate (url: string) {
    if (url !== location.value) {
      // if (guard) {
      //   const target = toLinkTarget(url)
      //   const newTarget = guard(service, target)
      //   url = toUrl(newTarget)
      // }

      history.pushState(null, '', url)
      location.value = url
    }
  }

  function getLocation (): Location {
    const path = location.value.split('/')
    const app = path[1] === '' ? platform.getMetadata(ui.metadata.DefaultApplication) : path[1]
    path.splice(0, 2)
    return { app, path }
  }

  function toUrl (location: Location): string {
    const current = getLocation()
    const app = location.app || current.app
    const path = location.path.join('/')

    return '/' + app + '/' + path
  }


  // C O M P O N E N T S

  platform.setResource(ui.component.Spinner, Spinner)
  platform.setResource(ui.component.BadComponent, BadComponent)

  // S E R V I C E

  const service = {
    getApp () {
      return app
    },
    navigate,
    toUrl,
    getLocation
  }

  app.provide(UIInjectionKey, service)

  return service
}
