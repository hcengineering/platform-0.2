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


import { AnyPlugin, Platform } from '@anticrm/platform'
import { AnyComponent, BootService, VueConstructor } from '.'
import { h, reactive, ref, createApp, defineComponent } from 'vue'

import Root from './internal/Root.vue'
import BootLoader from './internal/SysInfo.vue'

console.log('Plugin `ui` loaded')

/*!
 * Anticrm Platform™ Bootloader Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: {}): Promise<BootService> => {
  console.log('Plugin `ui` started')

  // V U E  A P P

  const app = createApp(Root)
  app.config.globalProperties.$platform = platform

  // C O M P O N E N T S

  const components = new Map<AnyComponent, VueConstructor>()

  async function resolve (component: AnyComponent): Promise<VueConstructor> {
    console.log('resolve: ' + component)
    let comp = components.get(component)
    if (comp) { return comp }
    const index = component.indexOf(':') + 1
    const dot = component.indexOf('.', index)
    const id = component.substring(index, dot) as AnyPlugin
    console.log('loading from ' + id)
    const plugin = await platform.getPlugin(id)
    comp = components.get(component)
    if (comp) { return comp }
    throw new Error('plugin ' + plugin + ' does not provide component: ' + component)
  }

  function registerComponent(id: AnyComponent, component: VueConstructor): void {
    if (components.get(id)) {
      throw new Error('component already registered: ' + id)
    }
    components.set(id, component)
  }

  // R E G I S T E R  C O M P O N E N T S

  // components.set(BootLoaderId, BootLoader)

  // C O M P O N E N T  R E N D E R E R

  app.component('widget', defineComponent({
    props: {
      component: String // as PropType<Component<VueConstructor>>
    },
    setup() {
      return {
        resolved: ref(''),
      }
    },
    render () {
      const cached = components.get(this.component)
      if (cached) {
        return h(cached)
      }
      if (this.component !== this.resolved) {
        resolve(this.component as AnyComponent).then(resolved => {
          this.resolved = this.component
        })
        return h('div', [])
      } else {
        const resolved = components.get(this.resolved)
        if (resolved) {
          return h(resolved)
        } else {
          return h('div', [])
        }
      }
    }
  }))

  return {
    getApp() { return app },
    registerComponent,
    resolve
  }

}