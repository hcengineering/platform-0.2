<!--
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
-->

<script lang="ts">
import { defineComponent, computed, ref, onMounted, reactive } from 'vue'
import { PerspectiveCamera, Scene } from 'three'
import { OrbitControls } from './OrbitControls'

function epsilon (value: number) {
  return Math.abs(value) < 1e-10 ? 0 : value
}

function cameraPerspective (camera: PerspectiveCamera, height: number) {
  return (camera.projectionMatrix.elements[5] * height / 2) + 'px'
}

function cameraStyle (camera: PerspectiveCamera, size: { width: number, height: number }) {
  camera.updateMatrixWorld()
  const elements = camera.matrixWorldInverse.elements

  const style = {
    width: size.width + 'px',
    height: size.height + 'px',
    transform:
      'translateZ(' + cameraPerspective(camera, size.height) + ')' +

      'matrix3d(' +
      epsilon(elements[0]) + ',' +
      epsilon(- elements[1]) + ',' +
      epsilon(elements[2]) + ',' +
      epsilon(elements[3]) + ',' +
      epsilon(elements[4]) + ',' +
      epsilon(- elements[5]) + ',' +
      epsilon(elements[6]) + ',' +
      epsilon(elements[7]) + ',' +
      epsilon(elements[8]) + ',' +
      epsilon(- elements[9]) + ',' +
      epsilon(elements[10]) + ',' +
      epsilon(elements[11]) + ',' +
      epsilon(elements[12]) + ',' +
      epsilon(- elements[13]) + ',' +
      epsilon(elements[14]) + ',' +
      epsilon(elements[15]) +
      ')' +

      'translate(' + size.width / 2 + 'px,' + size.height / 2 + 'px)'
  }
  return style
}

function noop (x: any) {

}

export default defineComponent({
  props: {
    fov: Number,
    near: Number,
    far: Number,
    x: Number,
    y: Number,
    z: Number,
    w: Number,
    h: Number
  },
  setup (props) {
    const aspect = props.w / props.h
    const camera = new PerspectiveCamera(props.fov, aspect, props.near, props.far)
    camera.position.x = props.x
    camera.position.y = props.y
    camera.position.z = props.z

    const root = ref(null)
    const cameraChange = ref(0)

    onMounted(() => {
      const controls = new OrbitControls(camera, root.value)
      controls.minDistance = 500
      controls.maxDistance = 6000
      controls.addEventListener('change', () => {
        cameraChange.value++
      })
    })

    const style = computed(() => {
      noop(cameraChange.value)
      return cameraStyle(camera, { width: 1000, height: 1000 })
    })
    const fov = computed(() => {
      noop(cameraChange.value)
      return cameraPerspective(camera, props.h)
    })

    return { root, style, fov }
  }
})
</script>

<template>
  <div ref="root" class="scene" :style="{perspective: fov, width: w + 'px', height: h + 'px'}">
    <div class="camera" :style="style">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.scene {
  overflow: hidden;
}
.camera {
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
}
</style>