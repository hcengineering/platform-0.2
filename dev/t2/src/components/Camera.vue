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
import { defineComponent, computed } from 'vue'
import { PerspectiveCamera, Scene } from 'three'

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
  console.log(style)
  return style
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
    console.log(camera)

    const style = computed(() => cameraStyle(camera, { width: 1000, height: 1000 }))
    const fov = computed(() => cameraPerspective(camera, props.h))
    return { style, fov }
  }
  // size () {
  //   const camera = this.$refs['camera'] as HTMLElement
  //   const width = 1000 //camera.clientWidth
  //   const height = 1000 //camera.clientHeight
  //   return { width, height }
  // },
})
</script>

<template>
  <div class="scene" :style="{perspective: fov, width: w + 'px', height: h + 'px'}">
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