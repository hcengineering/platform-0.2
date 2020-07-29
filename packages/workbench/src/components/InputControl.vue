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
import workbench from '../..'
import ui from '@anticrm/platform-ui'
import presentationCore from '@anticrm/presentation-core'
import { Class, Ref, VDoc } from '@anticrm/platform'
import { getCoreService } from '../utils'

export default defineComponent({
  components: { Icon, CreateForm, CreateMenu },
  props: {
  },
  setup (props) {
    const coreService = getCoreService()
    const model = coreService.getModel()

    const showMenu = ref(false)
    const component = ref('')
    const componentClass = ref('')

    function add() {
      // component.value = recruiment.component.View2
      showMenu.value = !showMenu.value
    }

    function selectItem(_class: Ref<Class<VDoc>>) {
      showMenu.value = false

      const clazz = model.get(_class) as Class<VDoc>
      if (model.isMixedIn(clazz, presentationCore.class.DetailsForm)) {
        const properties = model.as(clazz, presentationCore.class.DetailsForm)
        componentClass.value = _class
        component.value = properties.form
      } else {
        component.value = ui.component.BadComponent
      }
    }

    function done() {
      component.value = ''
    }

    return {
      showMenu,
      component,
      componentClass,
      selectItem,
      add,
      done,
      workbench,
    }
  }
})

</script>

<template>
  <div class="workbench-input-control">
    <CreateForm v-if="component !== ''" :component="component" :_class="componentClass" @done="done"/>
    <div>
      <CreateMenu :visible="showMenu" @select="selectItem"/>
      <a href="#" @click.prevent="add"><Icon :icon="workbench.icon.Add" class="icon-embed-2x"/></a>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-input-control {
  width: 100%;

  background-color: $input-color;
  border: 1px solid $content-color-dark;
  border-radius: 4px;
  padding: 1em;
  box-sizing: border-box;
}
</style>