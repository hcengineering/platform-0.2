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

export default defineComponent({
  components: { EditBox, Button, ContentEditable },
  setup() {
    const session = getSession()
    let htmlValue = ref('')
    let isEmpty = computed(() => htmlValue.value.length == 0)
    let stylesEnabled = ref(false)
    return {
      htmlValue,
      isEmpty,
      stylesEnabled,

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
        this.$refs['input'].focus()

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
    }
  },
})
</script>

<template>
  <div class="chunter-chat-input">
    <div v-if="stylesEnabled" class="flex-column">
      <div class="edit-area">
        <ContentEditable
          ref="input"
          class="edit-box"
          :content="htmlValue"
          @update="updateValue($event)"
          @submit="handleSubmit()"
        />
      </div>
      <div class="separator" />
      <div class="style-buttons">
        <div class="button-block">
          <Button class="small">§</Button>
          <Button class="small" v-on:click="execCommand('bold')" style="font-weight:bold;">B</Button>
          <Button class="small" v-on:click="execCommand('italic')" style="font-weight:italic;">I</Button>
          <Button
            class="small"
            v-on:click="execCommand('underline')"
            style="font-weight:underline;"
          >U</Button>
          <Button class="small" v-on:click="execCommand('strikeThrough')">~</Button>
          <Button class="small" v-on:click="execCommand('insertUnorderedList')">L</Button>
          <Button class="small" v-on:click="execCommand('insertOrderedList')">O</Button>
          <Button class="small" v-on:click="execCommand('formatBlock', 'pre')">P</Button>
          <Button
            class="small"
            v-on:click="execCommand('insertHtml', '<div class=\'code-block\'/>')"
          >H</Button>
        </div>
        <div class="right-panel">
          <Button class="small" @click="handleSubmit()">▶️</Button>
          <Button class="small">😀</Button>
          <Button class="small" @click="toggleStyle()">Aa</Button>
        </div>
      </div>
    </div>
    <div v-else class="flex-row">
      <div class="edit-area">
        <Button class="small">§</Button>
        <ContentEditable
          ref="input"
          class="edit-box"
          :content="htmlValue"
          @update="updateValue($event)"
          @submit="handleSubmit()"
        />
      </div>
      <div class="right-panel">
        <Button class="small" @click="handleSubmit()">▶️</Button>
        <Button class="small">😀</Button>
        <Button class="small" @click="toggleStyle()">Aa</Button>
      </div>
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
  }
  .flex-row {
    display: flex;
    flex-direction: row;
  }

  .edit-area {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }
  .edit-box {
    width: 100%;
    height: 100%;
    min-height: 2em;
  }
  .edit-box:focus {
    outline: none;
  }
  .separator {
    width: 100%;
    height: 1px;
    background-color: grey;
  }
  .style-buttons {
    width: 100%;
    flex-direction: row;
    display: flex;
  }
  .button-block {
    min-height: 2em;
    display: flex;
  }
  .right-panel {
    flex-grow: 1;
    display: flex;
    flex-direction: row-reverse;
  }
  .code-block {
    background-color: red;
  }
  border: 1px solid;
}
</style>
