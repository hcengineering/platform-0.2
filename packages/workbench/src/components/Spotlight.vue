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
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'
import ui from '@anticrm/platform-ui'
import { getCoreService } from '../utils'

export default defineComponent({
  components: { Icon, EditBox },
  props: {
  },
  setup (props) {
    const coreService = getCoreService()
    const graph = coreService.getGraph()

    const visible = ref(false)
    const results = ref([])
    const query = ref('')

    watch(() => query.value, query => {
      results.value = graph.find(query)
    })

    function keydown (ev: KeyboardEvent) {
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
      visible,
      results,
      query
    }
  }
})
</script>

<template>
  <div class="workbench-spotlight" v-if="visible">
    <div class="modal">
      <Icon :icon="ui.icon.Search" class="icon-embed-2x" />&nbsp;
      <EditBox placeholder="Spotlight Search" v-model="query" />
      <div>
        <div v-for="(title, index) in results" :key="index">{{title.title}}</div>
      </div>
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
