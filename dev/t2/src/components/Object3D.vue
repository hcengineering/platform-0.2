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
import { Object3D, Scene } from 'three'

function epsilon (value: number) {
  return Math.abs(value) < 1e-10 ? 0 : value
}

export default defineComponent({
  props: {
    x: Number,
    y: Number,
    z: Number,
    rx: Number,
    ry: Number,
    rz: Number,
  },
  setup (props) {
    const scene = new Scene()
    const object = new Object3D()
    object.position.x = props.x
    object.position.y = props.y
    object.position.z = props.z
    object.rotation.x = props.rx
    object.rotation.y = props.ry
    object.rotation.z = props.rz
    scene.add(object)
    scene.updateMatrixWorld()

    const style = computed(() => {
      const elements = object.matrixWorld.elements
      const matrix3d = 'matrix3d(' +
        epsilon(elements[0]) + ',' +
        epsilon(elements[1]) + ',' +
        epsilon(elements[2]) + ',' +
        epsilon(elements[3]) + ',' +
        epsilon(- elements[4]) + ',' +
        epsilon(- elements[5]) + ',' +
        epsilon(- elements[6]) + ',' +
        epsilon(- elements[7]) + ',' +
        epsilon(elements[8]) + ',' +
        epsilon(elements[9]) + ',' +
        epsilon(elements[10]) + ',' +
        epsilon(elements[11]) + ',' +
        epsilon(elements[12]) + ',' +
        epsilon(elements[13]) + ',' +
        epsilon(elements[14]) + ',' +
        epsilon(elements[15]) +
        ')'

      return { transform: 'translate(-50%,-50%)' + matrix3d }
    })
    return { style }
  }
})
</script>

<template>
  <div style="position:absolute;" :style="style">
    <slot />
  </div>
</template>