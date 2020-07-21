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

import ContentEditable from './ContentEditable.vue'

import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.vue'
import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.vue'

export default defineComponent({
  components: { EditBox, Button, ContentEditable, Toolbar, ToolbarButton },
  setup() {
    const session = getSession()
    let htmlValue = ref('')
    let sendAllowed = ref(false)
    let styleState = ref({bold: false, italic: false, underline: false})
    const htmlEditor = ref(null)
    let stylesEnabled = ref(false)
    return {
      htmlValue,
      stylesEnabled,
      styleState,
      htmlEditor,
      sendAllowed,

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
            // this.value.value = ''
            this.updateValue('')
          })
      },
      execCommand(cmdName: string, cmdValue?: string) {
        document.execCommand(cmdName, false, cmdValue)
        htmlEditor.value.focus()

        console.log("html", htmlValue.value)
      },
      toggleStyle() {
        this.stylesEnabled = !this.stylesEnabled;
        console.log(stylesEnabled.value)
      },
      updateValue(newValue) {
        this.htmlValue = newValue
        console.log("New value: ", htmlValue.value)
      },
      updateState(newValue) {
        console.log("New state: ", newValue)
        this.sendAllowed = !newValue.empty
        this.styleState.bold = newValue.bold
        this.styleState.italic = newValue.italic
        this.styleState.underline = newValue.underline
      },
      markBold() {
        this.execCommand('bold')
        this.styleState.bold = !this.styleState.bold
        console.log("update bold style", this.styleState)
      },
    }
  },
})
</script>

<template>
  <div class="chunter-chat-input">
    <div :class="{'flex-column':stylesEnabled, 'flex-row': !stylesEnabled}">
      <Toolbar v-if="!stylesEnabled" class="style-buttons">
        <ToolbarButton class="small">§</ToolbarButton>
      </Toolbar>

      <ContentEditable
        ref="htmlEditor"
        :class="{'edit-box-vertical':stylesEnabled, 'edit-box': !stylesEnabled}"
        :content="htmlValue"
        @updateState="updateState"
        @update="updateValue($event)"
        @submit="handleSubmit()"
      />

      <div v-if="stylesEnabled" class="separator" />
      <Toolbar>
        <template v-if="stylesEnabled">
          <ToolbarButton class="small">§</ToolbarButton>
          <ToolbarButton class="small" v-on:click="markBold()" style="font-weight:bold;" :selected="styleState.bold">B</ToolbarButton>
          <ToolbarButton
            class="small"
            v-on:click="execCommand('italic')"
            style="font-weight:italic;"
            :selected="styleState.italic"
          >I</ToolbarButton>
          <ToolbarButton
            class="small"
            v-on:click="execCommand('underline')"
            style="font-weight:underline;"
            :selected="styleState.underline"
          >U</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('strikeThrough')">~</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('insertUnorderedList')">L</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('insertOrderedList')">O</ToolbarButton>
          <ToolbarButton class="small" v-on:click="execCommand('formatBlock', 'pre')">P</ToolbarButton>
          <ToolbarButton
            class="small"
            v-on:click="execCommand('insertHtml', '<div class=\'code-block\'></div>')"
          >H</ToolbarButton>
        </template>
        <template v-slot:right>
          <ToolbarButton class="small" @click="handleSubmit()" :selected="sendAllowed">▶️</ToolbarButton>
          <ToolbarButton class="small">😀</ToolbarButton>
          <ToolbarButton class="small" @click="toggleStyle()">Aa</ToolbarButton>
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

  .edit-box {
    width: 100%;
    height: 100%;
    align-self: center;
  }
  .edit-box-vertical {
    width: 100%;
    height: 100%;
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
