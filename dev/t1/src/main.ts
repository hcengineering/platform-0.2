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

// import { Platform } from '@anticrm/platform'
// import db from '@anticrm/platform-db'
// import core from '@anticrm/platform-core'
// import i18n from '@anticrm/platform-core-i18n'
// import ui from '@anticrm/platform-ui'
// import uiModel from '@anticrm/platform-ui-model'
// import workbench from '@anticrm/platform-workbench'
// import launch from '@anticrm/launch-dev'

// import { createApp } from 'vue'
import ErrorPage from './components/ErrorPage.vue'

// import { createApp } from 'vue'

import { createRenderer } from '@vue/runtime-core'

import { nodeOps, camera, scene, objects } from './dom/nodeOps'
import { patchProp } from './dom/patchProp'

import { CSS3DRenderer } from './libs/CSS3DRenderer.js'
import { TWEEN } from './libs/tween.module.min.js'

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'

function normalizeContainer (container: Element | string): Element | null {
  if (isString(container)) {
    const res = document.querySelector(container)
    return res
  }
  return container
}


export const createApp = ((root: any) => {
  const app = createRenderer({
    ...nodeOps, patchProp
  }).createApp(root)


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
    return proxy
  }

  return app
})

const renderer = new CSS3DRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.getElementById('container')?.appendChild(renderer.domElement)

window.addEventListener('resize', onWindowResize, false)

function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  render()

}

function transform (targets, duration) {

  TWEEN.removeAll()

  for (var i = 0; i < objects.length; i++) {

    var object = objects[i]
    var target = targets[i]

    new TWEEN.Tween(object.position)
      .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()

    new TWEEN.Tween(object.rotation)
      .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()

  }

  new TWEEN.Tween(this)
    .to({}, duration * 2)
    .onUpdate(render)
    .start()

}

function animate () {
  console.log('animate')

  requestAnimationFrame(animate)

  TWEEN.update()

  // controls.update()

}

function render () {

  renderer.render(scene, camera)

}

// import uiMeta from '@anticrm/platform-ui-model/src/__resources__/meta'
// import contactMeta from '@anticrm/contact/src/__resources__/meta'

// const platform = new Platform()
// platform.setMetadata(ui.metadata.DefaultApplication, workbench.component.Workbench)

// platform.addLocation(db, () => import(/* webpackChunkName: "platform-db" */ '@anticrm/platform-db/src/memdb'))
// platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin'))
// platform.addLocation(i18n, () => import(/* webpackChunkName: "platform-core-i18n" */ '@anticrm/platform-core-i18n/src/plugin'))
// platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin'))
// platform.addLocation(uiModel, () => import(/* webpackChunkName: "platform-ui-model" */ '@anticrm/platform-ui-model/src/plugin'))
// platform.addLocation(workbench, () => import(/* webpackChunkName: "platform-workbench" */ '@anticrm/platform-workbench/src/plugin'))
// platform.addLocation(launch, () => import(/* webpackChunkName: "launch-dev" */ '@anticrm/launch-dev/src/launch'))

// uiMeta(platform)
// contactMeta(platform)

// async function boot (): Promise<void> {
//   const uiPlugin = await platform.getPlugin(ui.id)
//   uiPlugin.getApp().mount('#app')
// }

// boot().catch(err => {
createApp(ErrorPage).mount('#app')
// })

// import './cards.js'

animate()