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

  import { defineComponent } from 'vue'
  import workbench from '..'

  import Table from '@anticrm/presentation-ui/src/components/Table.vue'
  import Icon from '@anticrm/platform-ui/src/components/Icon.vue'

  export default defineComponent({
    components: {
      Table,
      Icon
    },
    props: {
      _class: String
    },
    setup(props) {
      console.log('Browse', props._class)
      function add() {
        console.log('add')
        this.$emit('navigate', workbench.component.NewDocument)
      }
      return { workbench, add }
    }
  })
</script>

<template>
  <div>
    <div>
      <span class="caption-1">{{_class}}</span>&nbsp;
      <a href="#" @click.prevent="add"><Icon :icon="workbench.icon.Add" class="icon-embed-2x"/></a>
    </div>
    <Table :_class="_class" />
  </div>
</template>
