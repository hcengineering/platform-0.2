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
import { VueService, PlatformInjectionKey, VueInjectionKey, LinkTarget } from '.'
import { h, ref, reactive, createApp, defineComponent } from 'vue'
import Root from './internal/Root.vue'

console.log('Plugin `ui` loaded')
/*!
 * Anticrm Platform™ UI Components Plugin
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

  app.component('widget', defineComponent({
    props: {
      component: String // as PropType<Component<VueConstructor>>
    },
    setup (props, context) {
      console.log('widget:')
      console.log(props)
      console.log(context)
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
        return h('div', [])
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

  const location = ref(window.location.pathname)

  const onStateChange = () => { location.value = window.location.pathname }
  window.addEventListener('popstate', onStateChange)

  function getLocation (): LinkTarget {
    const split = location.value.split('/')
    const appValue = split[1].length === 0 ? platform.getMetadata(ui.metadata.DefaultApplication) : split[1]
    return {
      app: appValue as AnyComponent,
      path: split.splice(2).join('/')
    }
  }

  function navigate (target: LinkTarget) {
    console.log('navigate: ' + target)
    const newPath = target.path ?? ''
    const url = '/' + (target.app ?? getLocation().app) + '/' + newPath
    if (url !== location.value) {
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