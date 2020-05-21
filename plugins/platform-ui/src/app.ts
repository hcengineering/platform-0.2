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
import { createApp } from 'vue'

import { createRenderer } from '@vue/runtime-core'
import { nodeOps, scene } from './render/nodeOps'
import { patchProp } from './render/patchProp'

import { PerspectiveCamera } from 'three'
import { CSS3DRenderer } from './css3d/CSS3DRenderer'

import { createCity } from './city'

const create3DApp = ((root: any) => {

  const app = createRenderer({
    ...nodeOps, patchProp
  }).createApp(root)

  // U T I L S

  const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'
  const isString = (val: unknown): val is string => typeof val === 'string'

  function normalizeContainer (container: Element | string): Element | null {
    if (isString(container)) {
      const res = document.querySelector(container)
      return res
    }
    return container
  }

  // M O U N T

  const { mount } = app
  app.mount = (containerOrSelector: Element | string): any => {
    const container = normalizeContainer(containerOrSelector)
    if (!container) return
    const component = app._component
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML
    }
    // clear content before mounting
    container.innerHTML = ''
    const proxy = mount(container)
    container.removeAttribute('v-cloak')

    render()
    animate()
    return proxy
  }

  // C S S  3 D  R E N D E R E R

  // const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
  // camera.position.z = 1000

  var camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 500)
  camera.position.set(0, 2, 14)


  // const renderer = new CSS3DRenderer()
  const gl = createCity(camera)
  // renderer.setSize(window.innerWidth, window.innerHeight)
  // gl.setSize(window.innerWidth, window.innerHeight)
  // document.getElementById('container')?.appendChild(renderer.domElement)
  // document.getElementById('container')?.appendChild(gl.domElement)

  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    // renderer.setSize(window.innerWidth, window.innerHeight)
    // gl.setSize(window.innerWidth, window.innerHeight)
    render()
  }

  function render () {
    // renderer.render(scene, camera)
    // gl.render(scene, camera)
  }

  function animate () {
    //requestAnimationFrame(animate)
    gl()
  }

  return app
})

export function createPlatformApp (platform: Platform, root: any, _3d?: boolean) {
  const app = _3d ? create3DApp(root) : createApp(root)
  app.config.globalProperties.$platform = platform
  return app
}
