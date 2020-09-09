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
import { defineComponent, PropType, ref } from 'vue'
import workbench, { Application } from '../..'
import { getCoreService } from '../../utils'

import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.vue'

export default defineComponent({
  components: { Icon, LinkTo },
  props: {
    current: String
  },

  setup (props) {
    const apps = ref([] as Application[])
    const coreService = getCoreService()
    coreService.getModel().find(workbench.class.Application, {}).then(docs => {
      apps.value = docs as Application[]
    })

    return { apps }
  }
})
</script>

<template>
  <div class="workbench-nav">
    <div
      v-for="app in apps"
      class="app-icon"
      :class="{'current-app': app._id === current}"
      :key="app._id"
    >
      <a href="#" @click.prevent="$emit('navigate', app)">
        <Icon :icon="app.icon" class="icon-2x" />
      </a>
    </div>
    <div class="remainder"></div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-nav {
  display: flex;
  flex-direction: column;

  .app-icon {
    border-bottom: solid 1px $workspace-separator-color;
    // border-right: solid 1px $workspace-separator-color;
    height: $pictogram-size;

    .ui-icon {
      padding: 1em;
    }

    &.current-app {
      background-color: $content-bg-color;
      border-right: solid 1px $content-bg-color;
    }
  }

  .remainder {
    flex-grow: 1;
    border-right: solid 1px $workspace-separator-color;
  }
}
</style>