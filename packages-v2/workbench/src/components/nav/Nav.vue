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
  import { Location } from '@anticrm/platform-ui'
  import { getCoreService } from '../../int'
  import workbench, { Application } from '../..'

  import Icon from '@anticrm/platform-ui/src/components/Icon.vue'

  export default defineComponent({
    components: { Icon },
    props: {
      location: {
        type: Object as PropType<Location>,
        required: true
      }
    },

    setup(props) {
      const coreService = getCoreService()

      const apps = ref([] as Application[])

      coreService.getModel().find(workbench.class.Application, {}).then(docs => {
        console.log(docs)
        apps.value = docs as Application[]
      })

      const path = props.location.path
      const current = path.length > 0 ? path[0] : ''

      console.log(current)

      return {current, apps}
    }
  })
</script>

<template>
  <div class="workbench-nav">
    <div v-for="app in apps" class="app-icon" :class="{'current-app': app._id === current}">
      <Icon :icon="app.icon" class="icon-embed-2x" />
    </div>
  </div>
</template>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/css/_variables.scss";

  .workbench-nav {
    display: flex;
    flex-direction: column;

    .app-icon {
      border-bottom: solid 1px $workspace-separator-color;
      height: $pictogram-size;
      .ui-icon {
        padding:1em;
      }

      &.current-app {
        background-color: $content-bg-color;
      }
    }
  }

</style>