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
  import { defineComponent, PropType } from 'vue'
  import { Class, CreateTx, Ref, VDoc } from '@anticrm/platform'
  import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
  import workbench from '../..'
  import { getCoreService } from '../utils'

  export default defineComponent({
    components: { Icon },
    props: {
      _class: String as unknown as PropType<Ref<Class<VDoc>>>
    },
    setup(props) {

      const coreService = getCoreService()

      function add() {
        console.log('add')
        coreService.beginTransaction()
        const createTx: CreateTx = {

        }
      }

      return { workbench, add }
    }
  })
</script>

<template>
  <Icon :icon="workbench.icon.Add" class="icon-embed-2x workbench-add-item" @click="add"/>
</template>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/css/_variables.scss";

  .workbench-add-item {
    cursor: pointer;
  }
</style>