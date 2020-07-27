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
import { defineComponent, onMounted, ref, onUpdated } from 'vue'


export default defineComponent({
  components: {},
  props: {
    content: String,
  },
  setup(props) {
    const root = ref(null)
    function updateInnerHTML() {
      console.log("Setting value: ", props.content, root.position)
      if (root.value.innerHTML != props.content) {
        root.value.innerHTML = props.content;
      }
    }
    function scanFor(value: String, position: number, character: string): number {
      for (let i = position; i >= 0; i--) {
        console.log("check char: ", value[i])
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
    onMounted(updateInnerHTML)
    onUpdated(updateInnerHTML)
    return {
      root,
      update(event) {
        let range = window.getSelection().getRangeAt(0);
        let endPos = range.endOffset
        if (endPos > 0 && range.endContainer.nodeValue[endPos - 1] == "*") {
          let beginPos = scanFor(range.endContainer.nodeValue, endPos - 2, "*")
          if (beginPos != -1) {
            var sel = window.getSelection();
            sel.removeAllRanges();
            let newRange = document.createRange();

            let before = document.createTextNode(range.endContainer.nodeValue.substring(0, beginPos))
            let after = document.createTextNode(" " + range.endContainer.nodeValue.substring(endPos))

            let newText = document.createElement("strong")
            newText.appendChild(document.createTextNode(range.endContainer.nodeValue.substring(beginPos + 1, endPos - 1)))

            let parent = range.endContainer.parentElement


            parent.replaceChild(after, range.endContainer)

            parent.insertBefore(newText, after)
            parent.insertBefore(before, newText)

            newRange.setStart(after, 0)
            sel.addRange(newRange);
            document.execCommand("bold", false)
          }
        }
        let textValue = event.target.innerHTML
        this.$emit('update', textValue);
      },
      focus() {
        root.value.focus()
      },
      submit(event) {
        if (event.shiftKey) {
          return;
        }
        // do not propagate events
        event.preventDefault()
        event.stopPropagation()

        this.$emit('submit');
      }
    }
  }
})
</script>

<template>
  <div>
    <div ref="root" contenteditable="true" @input="update" @keydown.enter="submit($event)"></div>
  </div>
</template>


<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.chunter-curson-span {
  width: 1px;
}
</style>
