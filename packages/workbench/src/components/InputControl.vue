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
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import CreateForm from './CreateForm.vue'
import CreateMenu from './CreateMenu.vue'
import workbench, { WorkbenchCreateItem } from '..'
import ui from '@anticrm/platform-ui'

import presentationCore from '@anticrm/presentation-core'
import { Class, Ref, VDoc, StringProperty } from '@anticrm/platform'
import { getCoreService, getPresentationCore } from '../utils'

import core from '@anticrm/platform-core'

import ReferenceInput from '@anticrm/presentation-ui/src/components/ReferenceInput.vue'

interface ItemRefefence {
  id: string
  class: string
}

export default defineComponent({
  components: { Icon, CreateForm, CreateMenu, ReferenceInput },
  props: {
  },
  setup (props, context) {
    const coreService = getCoreService()
    const model = coreService.getModel()

    const presentationCoreService = getPresentationCore()

    const showMenu = ref(false)
    const component = ref('')
    const createItem = ref<WorkbenchCreateItem | null>(null)


    function selectItem (item: WorkbenchCreateItem) {
      showMenu.value = false
      createItem.value = item
      component.value = presentationCoreService.getComponentExtension(item.itemClass, presentationCore.class.DetailForm)
    }

    function add () {
      showMenu.value = !showMenu.value
    }
    function done () {
      component.value = ''
    }

    function handleSubmit (value) {
      context.emit('message', value)
    }

    return {
      showMenu,
      component,
      createItem,
      selectItem,
      add,
      done,
      workbench,
      handleSubmit,
    }
  }
})

</script>

<template>
  <div class="workbench-input-control">
    <ReferenceInput @message="handleSubmit">
      <template v-slot:top>
        <CreateForm
          v-if="component !== ''"
          :component="component"
          :_class="createItem.itemClass"
          :title="createItem.label"
          @done="done"
        />
      </template>
      <template v-slot:default>
        <CreateMenu :visible="showMenu" @select="selectItem" />
        <a class='add-button' href="#" @click.prevent="add">
          <Icon :icon="workbench.icon.Add" class="icon-2x" />
        </a>
      </template>
    </ReferenceInput>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-input-control {
  width: 100%;
  .add-button {
    display: flex;
  }
}
</style>
