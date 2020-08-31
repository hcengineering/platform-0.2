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
import { defineComponent, ref, PropType, onMounted, onUpdated } from 'vue'
export default defineComponent({
  components: {},
  props: {
    scrollPosition: Number,
  },
  setup(props, context) {
    let container = ref(null as HTMLElement)

    onMounted(() => {
      container.value.scrollTop = props.scrollPosition
    })
    onUpdated(() => {
      // Update top only if not fit,
      if (props.scrollPosition > container.value.clientHeight || props.scrollPosition < container.value.scrollTop) {
        container.value.scrollTop = props.scrollPosition
      }
    })

    return { container }
  }
})
</script>
<template>
  <div class="sparkling-scroll-view">
    <div class="container" ref="container">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.sparkling-scroll-view {
  position: relative;
  .container {
    overflow: scroll;
    position: absolute;
    height: 100%;
    width: 100%;
  }
}
</style>
