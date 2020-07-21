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
import { defineComponent, onMounted, ref, onUpdated, computed } from 'vue'


export default defineComponent({
  components: {},
  props: {
    content: String,
    hoverMessage: {
      type: String,
      default: "Placeholder...",
    },
  },
  setup(props) {
    const root = ref(null)

    // Calculate innerText from HTML
    let de = document.createElement("div")
    de.innerHTML = props.content
    const innerText = ref(de.innerText)

    function updateInnerHTML() {
      console.log("Setting value: ", props.content, root.position)
      if (root.value.innerHTML != props.content) {
        root.value.innerHTML = props.content;
      }
    }
    function scanFor(value: String, position: number, character: string): number {
      for (let i = position; i >= 0; i--) {
        // console.log("check char: ", value[i])
        if (value[i] == character) {
          return i
        }
        if (value[i] == ' ' || value[i] == '\t' || value[i] == '<' || value[i] == '>' || value[i] == '"' || value[i] == "'") {
          // termination trigger
          return -1
        }
      }
      return -1
    }
    function update(event) {
      // console.log("update: ", event)
      let range = window.getSelection().getRangeAt(0);
      if (event.inputType != "historyUndo") {
        let endPos = range.endOffset
        let nodeValue = range.endContainer.nodeValue
        if (endPos > 0 && nodeValue != null && nodeValue[endPos - 1] == "*") {
          let beginPos = scanFor(nodeValue, endPos - 2, "*")
          if (beginPos != -1) {
            var sel = window.getSelection();
            sel.removeAllRanges();
            let newRange = document.createRange();

            let newTextValue = nodeValue.substring(beginPos + 1, endPos - 1)

            newRange.setStart(range.endContainer, beginPos)
            newRange.setEnd(range.endContainer, endPos)
            sel.addRange(newRange)

            execCommand('insertHtml', `<strong>${newTextValue}</strong>`)
          }
        }
      }
      let textValue = event.target.innerHTML
      this.innerText = root.value.innerText

      this.$emit('update', textValue);

      // Also send state
      this.sendState(event)
    }
    function sendState(event) {
      let range = window.getSelection().getRangeAt(0);
      console.log(range)
      let selectedElement = range.startContainer

      if (!(selectedElement instanceof Element)) {
        selectedElement = selectedElement.parentElement
      }

      if (range.startOffset == range.startContainer.textContent.length && range.startContainer.nextSibling != null) {
        // We should select next element
        selectedElement = range.startContainer.nextSibling

        if (!(selectedElement instanceof Element) ) {
          selectedElement = selectedElement.parentElement
        }
      }

      let cs = getComputedStyle(selectedElement as Element)
      console.log(cs.textDecorationLine)
      this.$emit('updateState', {
        empty: isEmpty.value,
        bold: Number(cs.fontWeight) > 400 || cs.fontWeight === 'bold' || cs.fontWeight === 'bolder',
        italic: cs.fontStyle === 'italic',
        underline: cs.textDecorationLine === 'underline',
      })
    }
    function focus() {
      root.value.focus()
    }
    function submit(event) {
      if (event.shiftKey) {
        return;
      }
      // do not propagate events
      event.preventDefault()
      event.stopPropagation()

      this.$emit('submit');
    }
    function execCommand(cmdName: string, cmdValue?: string) {
      root.value.focus()
      document.execCommand(cmdName, false, cmdValue)
    }
    let isEmpty = computed(() => {
      return innerText.value.length === 0 || innerText.value === "\n"
    })

    onMounted(updateInnerHTML)
    onUpdated(updateInnerHTML)
    return {
      root,
      innerText,
      update,
      focus,
      submit,
      isEmpty,
      sendState,
    }
  },
  makeBold() {
    this.execCommand("bold")
  },
})
</script>

<template>
  <div class="content-editable">
    <div v-if="isEmpty" class="hover-message">{{hoverMessage}}</div>
    <div
      class="edit-box"
      ref="root"
      contenteditable="true"
      @input="update"
      @keyup="sendState($event)"
      @mouseup="sendState($event)"
      @keydown.enter="submit($event)"
    ></div>
  </div>
</template>


<style lang="scss">
.content-editable {
  margin: 5px;
  .chunter-curson-span {
    width: 1px;
  }
  .hover-message {
    color: #aaaaaa;
  }
  .edit-box:focus {
    outline: none;
  }
  .hover-message {
    position: absolute;
    pointer-events: none;
  }
}
</style>
