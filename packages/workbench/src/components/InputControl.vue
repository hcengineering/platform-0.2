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
import pcore from '@anticrm/presentation-core'

import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.vue'
import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.vue'

import EditorContent from '@anticrm/sparkling-rich/src/EditorContent.vue'
import { EditorContentEvent } from '@anticrm/sparkling-rich/src/index'

import contact, { User, Contact } from '@anticrm/contact/src/index'

import { Page } from '@anticrm/chunter/src/index'
import chunter from '@anticrm/chunter-model/src/index'

import CompletionPopup, { CompletionItem } from './CompletionPopup.vue'
import { schema } from '@anticrm/sparkling-rich/src/internal/schema'

import { EditorState, Transaction } from 'prosemirror-state'

function startsWith(str: string | undefined, prefix: string) {
  return (str ?? '').startsWith(prefix)
}

interface ItemRefefence {
  id: string
  class: string
}

export default defineComponent({
  components: { Icon, CreateForm, CreateMenu, EditorContent, Toolbar, ToolbarButton, CompletionPopup },
  props: {
  },
  setup(props, context) {
    const coreService = getCoreService()
    const model = coreService.getModel()

    const presentationCoreService = getPresentationCore()

    const showMenu = ref(false)
    const component = ref('')
    const createItem = ref<WorkbenchCreateItem | null>(null)

    let htmlValue = ref('')
    let styleState = ref({ isEmpty: true, cursor: { left: 0, top: 0, bottom: 0, right: 0 } } as EditorContentEvent)
    const htmlEditor = ref(null)
    let stylesEnabled = ref(false)

    let completions = ref({ items: [] as CompletionItem[] })
    let completionControl = ref(null)

    function add() {
      showMenu.value = !showMenu.value
    }

    function selectItem(item: WorkbenchCreateItem) {
      showMenu.value = false
      createItem.value = item
      component.value = presentationCoreService.getComponentExtension(item.itemClass, presentationCore.class.DetailForm)
    }

    function done() {
      component.value = ''
    }
    function findSpaces(userPrefix: string): Promise<CompletionItem[]> {
      return model.find(core.class.Space, {}).then(docs => {
        let items: CompletionItem[] = []
        const all = model.cast(docs, pcore.mixin.UXObject)
        for (const value of all) {
          if (startsWith(value.label, userPrefix) && value.label !== userPrefix) {
            let kk = value.label
            items.push({ key: kk, label: kk, title: kk + " - Space", class: core.class.Space, id: value._id } as CompletionItem)
          }
        }
        return items
      })
    }
    function findUsers(userPrefix: string): Promise<CompletionItem[]> {
      return coreService.find(contact.mixin.User, {}).then(docs => {
        const all = docs as User[]
        let items: CompletionItem[] = []
        for (const value of all) {
          if (startsWith(value.account, userPrefix) && value.account !== userPrefix) {
            let kk = value.account
            items.push({ key: kk, label: kk, title: kk + " - " + value.firstName + ' ' + value.lastName, class: value._class, id: value._id } as CompletionItem)
          }
        }
        return items
      })
    }
    function findPages(userPrefix: string): Promise<CompletionItem[]> {
      return coreService.find(chunter.class.Page, {}).then(docs => {
        const all = docs as Page[]
        let items: CompletionItem[] = []
        for (const value of all) {
          if (startsWith(value.title, userPrefix) && value.title !== userPrefix) {
            let kk = value.title
            items.push({ key: kk, label: kk, title: kk + "- Page", class: value._class, id: value._id } as CompletionItem)
          }
        }
        return items
      })
    }

    function findUser(title: string): Promise<ItemRefefence[]> {
      return coreService.find(contact.mixin.User, { account: title as StringProperty }).then((docs) => {
        return docs.filter((e) => (e as User).account == title).map((e) => {
          return { id: e._id, class: e._class } as ItemRefefence
        })
      })
    }


    function findPage(title: string): Promise<ItemRefefence[]> {
      return coreService.find(chunter.class.Page, { title: title as StringProperty }).then((docs) => {
        return docs.filter((e) => (e as Page).title == title).map((e) => {
          return { id: e._id, class: e._class } as ItemRefefence
        })
      })
    }

    function findSpace(title: string): Promise<ItemRefefence[]> {
      return coreService.find(pcore.mixin.UXObject, { label: title as StringProperty }).then((docs) => {
        return docs.map((e) => {
          return { id: e._id, class: e._class } as ItemRefefence
        })
      })
    }

    function updateStyle(event: EditorContentEvent) {
      styleState.value = event

      if (event.completionWord.length == 0) {
        completions.value = {
          items: []
        }
        return
      }
      let word = event.completionWord
      if (word.startsWith("@")) {
        findUsers(word.substring(1)).then((items) => {
          completions.value = {
            items: items
          }
        })
      } else if (word.startsWith("#")) {
        findSpaces(word.substring(1)).then((items) => {
          completions.value = {
            items: items
          }
        })
      } else if (event.completionWord.startsWith("[[")) {
        const userPrefix = event.completionWord.substring(2)

        Promise.all([findSpaces(userPrefix), findUsers(userPrefix), findPages(userPrefix)])
          .then((result) => {
            completions.value = {
              items: result.reduce((acc, val) => {
                return acc.concat(val)
              }, [])
            }
          })
      } else {
        completions.value = {
          items: []
        }
      }
    }
    function handlePopupSelected(value) {
      let extra = 0
      if (styleState.value.completionEnd != null && styleState.value.completionEnd.endsWith("]]")) {
        extra = styleState.value.completionEnd.length
      }
      htmlEditor.value.insertMark(
        "[[" + value.label + "]] ",
        styleState.value.selection.from - styleState.value.completionWord.length,
        styleState.value.selection.to + extra, schema.marks.reference, { id: value.id, class: value.class })
      htmlEditor.value.focus()
    }
    function handleSubmit() {
      context.emit('message', htmlValue.value)
      htmlValue.value = ''
    }
    function onKeyDown(event) {
      if (completions.value.items.length > 0) {
        if (event.key === "ArrowUp") {
          completionControl.value.handleUp()
          event.preventDefault()
          return
        }
        if (event.key === "ArrowDown") {
          completionControl.value.handleDown()
          event.preventDefault()
          return
        }
        if (event.key === "Enter") {
          completionControl.value.handleSubmit()
          event.preventDefault()
          return
        }
        if (event.key === "Escape") {
          completions.value = { items: [] }
          return
        }
      }
      if (event.key === "Enter" && !event.shiftKey) {
        handleSubmit()
        event.preventDefault()
      }
    }
    function transformInjections(state: EditorState): Promise<Transaction> {
      let tr: Transaction = null

      let operations: ((Transaction) => Transaction)[] = []
      let promises: Promise<void>[] = []

      state.doc.descendants((node, pos) => {
        if (node.isText) {

          let prev = { id: "", class: "" } as ItemRefefence
          // Check we had our reference marl
          // Check if we had trigger words without defined marker
          for (let i = 0; i < node.marks.length; i++) {
            if (node.marks[i].type == schema.marks.reference) {
              // We had our mark already, check if it name fit with document type
              // If not fit we need to covert it to Page type.
              if (!node.text.startsWith("[[") || !node.text.endsWith("]]")) {
                operations.push((tr) => {
                  return (tr == null ? state.tr : tr).removeMark(pos, pos + node.nodeSize, node.marks[i])
                })
              }
              prev = { id: node.attrs.id, class: node.attrs.class }
              break
            }
          }

          const len = node.text.length
          for (let i = 0; i < len; i++) {
            let text = node.text.substring(i)
            if (text.startsWith("[[")) {
              // We found trigger, we need to call replace method
              let endpos = text.indexOf("]]")
              if (endpos != -1) {
                let end = endpos + 2
                if (end != i) {
                  let refText = node.text.substring(i + 2, i + end - 2)
                  let ci = i
                  let cpos = pos
                  let cend = end
                  promises.push(Promise.all([
                    findUser(refText),
                    findPage(refText),
                    //findSpace(refText)
                  ])
                    .then((result) => {
                      let items = result.reduce((acc, val) => { return acc.concat(val) }, [])
                      if (items.length > 1) {
                        // Check if we had item selected already
                        for (let ii = 0; ii < items.length; ii++) {
                          if (items[ii].id == prev.id) {
                            items = [items[ii]]
                            break
                          }
                        }
                      }
                      if (items.length == 1) {
                        operations.push((tr: Transaction): Transaction => {
                          let mark = schema.marks.reference.create(items[0])
                          return (tr == null ? state.tr : tr).addMark(cpos + ci, cpos + ci + cend, mark)
                        })
                      } else if (items.length == 0) {
                        operations.push((tr: Transaction): Transaction => {
                          let mark = schema.marks.reference.create({ id: 'undefined', class: "Page" })
                          return (tr == null ? state.tr : tr).addMark(cpos + ci, cpos + ci + cend, mark)
                        })
                      }
                    })
                  )
                  i = end// Move to next char
                }
              }
            }
          }
        }
      })

      return Promise.all(promises).then(() => {
        let tr: Transaction = null
        for (let i = 0; i < operations.length; i++) {
          let t = operations[i]
          if (t != null) {
            tr = t(tr)
          }
        }
        return tr
      })
    }

    return {
      showMenu,
      component,
      createItem,
      selectItem,
      add,
      done,
      workbench,
      htmlValue,
      htmlEditor,
      styleState,
      stylesEnabled,
      updateStyle,
      completions,
      onKeyDown,
      handlePopupSelected,
      completionControl,
      handleSubmit,
      transformInjections,
      triggers: ['@', '#', '[['] as Array<String>,
    }
  }
})

</script>

<template>
  <div class="workbench-input-control">
    <CreateForm
      v-if="component !== ''"
      :component="component"
      :_class="createItem.itemClass"
      :title="createItem.label"
      @done="done"
    />
    <div>
      <div :class="{'flex-column':stylesEnabled, 'flex-row': !stylesEnabled}">
        <Toolbar v-if="!stylesEnabled" class="style-buttons">
          <CreateMenu :visible="showMenu" @select="selectItem" />
          <a href="#" @click.prevent="add">
            <Icon :icon="workbench.icon.Add" class="icon-embed-2x" />
          </a>
        </Toolbar>

        <editor-content
          ref="htmlEditor"
          :class="{'edit-box-vertical':stylesEnabled, 'edit-box-horizontal': !stylesEnabled}"
          :content="htmlValue"
          :triggers="triggers"
          :transformInjections="transformInjections"
          @update:content="htmlValue = $event"
          @styleEvent="updateStyle"
          @keyDown="onKeyDown"
        />
        <completion-popup
          ref="completionControl"
          v-if="completions.items.length > 0 "
          :items="completions.items"
          :pos="styleState.cursor"
          @select="handlePopupSelected"
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
  yarn .flex-column {
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
  reference {
    color: lightblue;
  }
  reference[id="undefined"] {
    color: grey;
  }
}
</style>
