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
import workbench from '@anticrm/workbench'

import Table from '@anticrm/presentation-ui/src/components/Table.vue'

export default defineComponent({
    components: { Table },
    props: {
      _class: String
    },
    setup(props) {
      return { workbench }
    }
  })
</script>

<template>
  <div><span class="caption-1">Задачи</span>&nbsp;<AddItem :_class="_class" /></div>
  <Table _class="class:task.Task" />
</template>
