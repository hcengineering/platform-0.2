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

import { defineComponent, ref, watch, onUnmounted } from 'vue'
import { Doc } from '@anticrm/platform'

import Table from '@anticrm/presentation-ui/src/components/Table.vue'
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.vue'
import ChunterItem from './ChunterItem.vue'

import core from '@anticrm/platform-core'

import { getCoreService } from '../utils'

export default defineComponent({
  components: {
    ScrollView,
    Table,
    Icon,
    ChunterItem,
  },
  props: {
  },
  setup (props, context) {
    const coreService = getCoreService()

    const content = ref([] as Doc[])

    // const q = props.space ? { space: props.space } as unknown as AnyLayout : {}
    const shutdown = coreService.query(core.class.CreateTx, {}, (result: Doc[]) => {
      content.value = result
    })

    onUnmounted(() => shutdown())

    return { open, content }
  }
})
</script>

<template>
  <div class="chunter-chunter-view">
    <div>
      <span class="caption-1">Chunter</span>&nbsp;
      <!--      <a href="#" @click.prevent="add"><Icon :icon="workbench.icon.Add" class="icon-embed-2x"/></a>-->
    </div>
    <ScrollView>
      <div class="content">
        <ChunterItem :tx="doc" v-for="doc in content" :key="doc._id" @open="$emit('open', $event)" />
      </div>
    </ScrollView>
  </div>
</template>

<style lang="scss">
.chunter-chunter-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sparkling-scroll-view {
    height: 100%;
  }

  .content {
    flex-grow: 1;
  }
}
</style>