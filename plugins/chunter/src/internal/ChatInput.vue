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
import { defineComponent, ref, computed } from 'vue'
import { Ref } from '@anticrm/platform-core'
import { Account, User } from '@anticrm/platform-business'
import { getSession } from '@anticrm/platform-vue'

import chunter, { Channel, DocMessage } from '..'
import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'
import { Resource } from '@anticrm/platform'

import EditorContent from '@anticrm/sparkling-rich/src/EditorContent'

import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.vue'
import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.vue'

export default defineComponent({
  components: { EditBox, Button, EditorContent, Toolbar, ToolbarButton },
  setup() {
    const session = getSession()
    let htmlValue = ref('<strong>TEst</strong> Some other text')
    let styleState = ref({ isEmpty: true })
    const htmlEditor = ref(null)
    let stylesEnabled = ref(false)
    return {
      htmlValue,
      stylesEnabled,
      styleState,
      htmlEditor,

      handleSubmit() {
        let newValue = {
          createdOn: new Date(),
          createdBy: '' as Ref<Account>,
          onBehalfOf: '' as Ref<User>,
          text: this.htmlValue,
          channel: '' as Ref<Channel>,
          participants: [],
          replies: [],
        };
        session.newInstance(chunter.class.DocMessage, newValue)
          .then(() => session.commit())
          .then(() => {
            this.htmlValue = ''
          })
      }
    }
  },
})
</script>

<template>
  <div class="chunter-chat-input">
    <div :class="{'flex-column':stylesEnabled, 'flex-row': !stylesEnabled}">
      <Toolbar v-if="!stylesEnabled" class="style-buttons">
        <ToolbarButton>§</ToolbarButton>
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
          <ToolbarButton>§</ToolbarButton>
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
            v-on:click="execCommand('underline')"
            style="font-weight:underline;"
            :selected="styleState.underline"
          >U</ToolbarButton>
          <ToolbarButton class="small" v-on:click="htmlEditor.toggleStrike()" :selected="styleState.strike">~</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('insertUnorderedList')">L</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('insertOrderedList')">O</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('formatBlock', 'pre')">P</ToolbarButton>
          <ToolbarButton
            class="small"
            v-on:click="execCommand('insertHtml', '<div class=\'code-block\'></div>')"
          >H</ToolbarButton>
        </template>
        <template v-slot:right>
          <ToolbarButton class="small" @click="handleSubmit()" :selected="!styleState.isEmpty">▶️</ToolbarButton>
          <ToolbarButton class="small">😀</ToolbarButton>
          <ToolbarButton class="small" @click="stylesEnabled = !stylesEnabled">Aa</ToolbarButton>
        </template>
      </Toolbar>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.chunter-chat-input {
  border-radius: 8;

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
  .separator {
    width: 100%;
    height: 1px;
    background-color: grey;
  }
  .code-block {
    background-color: grey;
    display: block;
    border: 1px dashed grey;
    width: calc(100% - 1em);
    min-height: 1.5em;
    // margin: 1em;
  }
  border: 1px solid;
}
</style>
