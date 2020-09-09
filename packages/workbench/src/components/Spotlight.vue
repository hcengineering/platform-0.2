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
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import ui from '@anticrm/platform-ui'

export default defineComponent({
  components: { Icon },
  props: {
  },
  setup (props) {
    const visible = ref(false)

    function keydown (ev: KeyboardEvent) {
      console.log(ev.key)
      switch (ev.key) {
        case 'S':
          visible.value = !visible.value
          break
        case 'Escape':
          if (visible.value) {
            visible.value = false
          }
          break
      }
    }

    onMounted(() => window.addEventListener('keydown', keydown))
    onUnmounted(() => window.removeEventListener('keydown', keydown))

    return {
      ui,
      visible
    }
  }
})
</script>

<template>
  <div class="workbench-spotlight" v-if="visible">
    <div class="modal">
      <Icon :icon="ui.icon.Search" class="icon-embed-2x" />&nbsp;
      <input />
    </div>
    <div class="modal-overlay"></div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-spotlight {
  // display: none;
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;

    border: 1px solid $workspace-separator-color;
    border-radius: 0.5em;
    padding: 1em 1em;
    background-color: $nav-bg-color;

    // width: 480px;

    input {
      background-color: $nav-bg-color;
      border: none;
      outline: none;
      font-family: Raleway;
      font-size: 2em;
      width: 400px;
    }
  }
  .modal-overlay {
    z-index: 1000;
    background: rgba(0, 0, 0, 0.4);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  // &.open {
  //   display: block;
  // }
}
</style>
