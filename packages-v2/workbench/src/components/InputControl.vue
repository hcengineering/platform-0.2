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
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import CreateForm from './CreateForm.vue'
import workbench from '../..'
import recruiment from '@anticrm/recruitment'
import { Location } from '@anticrm/platform-ui'

export default defineComponent({
  components: { Icon, CreateForm },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true
    }
  },
  setup (props) {
    const component = ref('')

    function add() {
      component.value = recruiment.component.View2
    }

    function done() {
      component.value = ''
    }

    return {
      add,
      done,
      workbench,
      component
    }
  }
})

</script>

<template>
  <div class="workbench-input-control">
<!--    <widget v-if="component !== ''" :component="component" _class="class:recruitment.Candidate"/>-->
    <CreateForm v-if="component !== ''" :component="component" _class="class:recruitment.Candidate" @done="done"/>
    <div>
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