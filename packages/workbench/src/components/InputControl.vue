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
import workbench from '../..'
import recruiment from '@anticrm/recruitment'

import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.vue'
import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.vue'
import EditorContent from '@anticrm/sparkling-rich/src/EditorContent'

export default defineComponent({
  components: { Icon, CreateForm, EditorContent, Toolbar, ToolbarButton },
  props: {
  },
  setup(props) {
    const component = ref('')

    let htmlValue = ref('<strong>TEst</strong> Some other text')
    let styleState = ref({ isEmpty: true })
    const htmlEditor = ref(null)
    let stylesEnabled = ref(false)

    function add() {
      component.value = recruiment.component.View2
    }

    function done() {
      component.value = ''
    }
    function handleSubmit() {
      htmlValue.value = ''
    }

    return {
      add,
      done,
      workbench,
      component,
      htmlValue,
      htmlEditor,
      styleState,
      stylesEnabled,
      handleSubmit
    }
  }
})

</script>

<template>
  <div class="workbench-input-control">
    <!--    <widget v-if="component !== ''" :component="component" _class="class:recruitment.Candidate"/>-->
    <CreateForm
      v-if="component !== ''"
      :component="component"
      _class="class:recruitment.Candidate"
      @done="done"
    />
    <div>
      <div :class="{'flex-column':stylesEnabled, 'flex-row': !stylesEnabled}">
        <Toolbar v-if="!stylesEnabled" class="style-buttons">
          <a href="#" @click.prevent="add">
            <Icon :icon="workbench.icon.Add" class="icon-embed-2x" />
          </a>
        </Toolbar>

        <editor-content
          ref="htmlEditor"
          :class="{'edit-box-vertical':stylesEnabled, 'edit-box-horizontal': !stylesEnabled}"
          :content="htmlValue"
          @update:content="htmlValue = $event"
          @styleEvent="styleState = $event"
          @submit="handleSubmit()"
        />

        <div v-if="stylesEnabled" class="separator" />
        <Toolbar>
          <template v-if="stylesEnabled">
            <a href="#" @click.prevent="add">
              <Icon :icon="workbench.icon.Add" class="icon-embed-2x" />
            </a>
            <ToolbarButton
              class="small"
              @click="htmlEditor.toggleBold()"
              style="font-weight:bold;"
              :selected="styleState.bold"
            >B</ToolbarButton>
            <ToolbarButton
              class="small"
              @click="htmlEditor.toggleItalic()"
              style="font-weight:italic;"
              :selected="styleState.italic"
            >I</ToolbarButton>
            <ToolbarButton
              class="small"
              v-on:click="htmlEditor.toggleUnderline()"
              style="font-weight:underline;"
              :selected="styleState.underline"
            >U</ToolbarButton>
            <ToolbarButton
              class="small"
              v-on:click="htmlEditor.toggleStrike()"
              :selected="styleState.strike"
            >~</ToolbarButton>
            <ToolbarButton class="small" v-on:click="htmlEditor.toggleUnOrderedList()">L</ToolbarButton>
            <ToolbarButton class="small" v-on:click="htmlEditor.toggleOrderedList()">O</ToolbarButton>
          </template>
          <template v-slot:right>
            <ToolbarButton class="small" @click="handleSubmit()" :selected="!styleState.isEmpty">▶️</ToolbarButton>
            <ToolbarButton class="small">😀</ToolbarButton>
            <ToolbarButton class="small" @click="stylesEnabled = !stylesEnabled">Aa</ToolbarButton>
          </template>
        </Toolbar>
      </div>
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

  .flex-column {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
  }

  .edit-box-horizontal {
    width: 100%;
    height: 100%;
    align-self: center;
  }
  .edit-box-vertical {
    width: 100%;
    height: 100%;
    margin: 5px;
  }
}
</style>
