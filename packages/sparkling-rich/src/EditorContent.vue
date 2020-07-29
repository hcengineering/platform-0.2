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
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

import { DOMParser } from 'prosemirror-model'

import { schema } from './internal/schema'

import { AllSelection, EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'

import { buildKeymap } from './internal/keymap'
import { buildInputRules } from './internal/input_rules'
import { Commands } from './internal/commands'

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false


export default defineComponent({
  components: {},
  props: {
    content: String,  // HTML content.
    hoverMessage: {
      type: String,
      default: "Placeholder...",
    },
  },
  model: {
    'props': "content",
  },
  setup(props, context) {
    const root = ref(null)

    let editRoot = document.createElement('div')

    const parser = new window.DOMParser()
    const element = parser.parseFromString(props.content, 'text/html').body

    function checkEmpty(value: string): boolean {
      return value.length === 0 || value === "<p><br></p>"
    }

    let isEmpty = computed(() => {
      return checkEmpty(props.content)
    })

    let state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(element),
      plugins: [
        history(),
        buildInputRules(),
        keymap(buildKeymap()),
        keymap({
          'Enter': (state, dispatch) => {

            context.emit('submit', view.dom.innerHTML)
            return true;
          }
        }),
      ]
    })
    let view = new EditorView(editRoot, {
      state,
      dispatchTransaction(transaction) {
        let newState = view.state.apply(transaction)
        view.updateState(newState)

        let innerDOMValue = view.dom.innerHTML
        context.emit("update:content", innerDOMValue)

        // Check types
        let marks = view.state.storedMarks || view.state.selection.$from.marks()

        let isBold = schema.marks.strong.isInSet(marks) != null
        let isItalic = schema.marks.em.isInSet(marks) != null
        let isStrike = schema.marks.strike.isInSet(marks) != null
        let isUnderline = schema.marks.underline.isInSet(marks) != null

        let evt = {
          isEmpty: checkEmpty(innerDOMValue),
          bold: isBold, isBoldEnabled: Commands.toggleStrong(view.state, null),
          italic: isItalic, isItalicEnabled: Commands.toggleItalic(view.state, null),
          strike: isStrike, isStrikeEnabled: Commands.toggleStrike(view.state, null),
          underline: isUnderline, isUnderlineEnabled: Commands.toggleUnderline(view.state, null)
        }
        context.emit("styleEvent", evt)
      }
    })

    onMounted(() => {
      root.value.appendChild(editRoot)
    })
    watch(() => props.content, content => {
      if (content != view.dom.innerHTML) {

        const parser = new window.DOMParser()
        const element = parser.parseFromString(props.content, 'text/html').body
        // console.log("parser body:", element)
        let newDoc = DOMParser.fromSchema(schema).parse(element)

        let op = state.tr.setSelection(new AllSelection(state.doc)).replaceSelectionWith(newDoc);
        let newState = state.apply(op)

        view.updateState(newState)

        view.focus()
      }
    })

    return {
      root,
      view,
      isEmpty,

      // Some operations
      toggleBold() {
        Commands.toggleStrong(view.state, view.dispatch)
        view.focus()
      },
      toggleItalic() {
        Commands.toggleItalic(view.state, view.dispatch)
        view.focus()
      },
      toggleStrike() {
        Commands.toggleStrike(view.state, view.dispatch)
        view.focus()
      },
      toggleUnderline() {
        Commands.toggleUnderline(view.state, view.dispatch)
        view.focus()
      },
      toggleUnOrderedList() {
        Commands.toggleUnOrdered(view.state, view.dispatch)
        view.focus()
      },
      toggleOrderedList() {
        Commands.toggleOrdered(view.state, view.dispatch)
        view.focus()
      }
    }
  },
})
</script>

<template>
  <div class="sparkling-rich-editor-content">
    <div v-if="isEmpty" class="hover-message">{{hoverMessage}}</div>
    <div class="edit-box" ref="root"></div>
  </div>
</template>


<style lang="scss">
.sparkling-rich-editor-content {
  .chunter-curson-span {
    width: 1px;
  }
  .hover-message {
    margin: 5px;
    color: #aaaaaa;
  }
  .edit-box {
    width: 100%;
    div {
      outline: none;
      p {
        margin: 5px;
      }
      blockquote {
        border-left: 1.5px solid #bbb;
        margin: 5px;
      }
    }
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
