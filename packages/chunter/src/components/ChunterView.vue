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

import { defineComponent, ref } from 'vue'

import Table from '@anticrm/presentation-ui/src/components/Table.vue'
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.vue'

import core from '@anticrm/platform-core'

import { getCoreService } from '@anticrm/workbench/src/utils'
import { buildModel } from '../model'

export default defineComponent({
    components: {
      ScrollView,
      Table,
      Icon,
    },
    props: {
    },
    setup(props, context) {
      const coreService = getCoreService()
      const content = ref([])

      buildModel(coreService).then(model => content.value = model)

      function open(object: Object) {
        context.emit('open', object)
      }

      return { core, open, content }
    }
  })
</script>

<template>
  <div class="chunter-chunter-view">
    <div>
      <span class="caption-1">Chunter</span>&nbsp;
<!--      <a href="#" @click.prevent="add"><Icon :icon="workbench.icon.Add" class="icon-embed-2x"/></a>-->
    </div>
    <div class="content">
      <div class="item" v-for="doc in content">
        <img class="avatar" src="../../assets/ava2x48.jpg">
        <div class="details"><b>Andrey Platov</b> 15:23</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

.chunter-chunter-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex-grow: 1;

    .item {
      display: flex;
      margin: 1em;

      .avatar {
        object-fit: cover;
        border-radius: 4px;
        width: 3em;
        height: 3em;
      }

      .details {
        padding-left: 1em;
      }
    }
  }
}
</style>