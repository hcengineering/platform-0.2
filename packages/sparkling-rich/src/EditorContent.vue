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
import { computed, defineComponent, onMounted, ref, watch, PropType } from 'vue'

import { DOMParser, Fragment, Slice, Mark, MarkType } from 'prosemirror-model'

import { schema } from './internal/schema'

import { AllSelection, EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'

import { buildKeymap } from './internal/keymap'
import { buildInputRules } from './internal/input_rules'
import { Commands } from './internal/commands'
import { EditorContentEvent } from './index'

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

export default defineComponent({
  components: {},
  props: {
    content: String,  // HTML content.
    hoverMessage: {
      type: String,
      default: "Placeholder...",
    },
    triggers: {
      type: Array as PropType<Array<String>>, // A set of completion separators
      default: "",
    },
    transformInjections: { // A function to match and replace trigger with marker
      type: Function, // transformInjections(state: EditorState): Transaction
      default: null,
    }
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

    function findCompletion(sel): { completionWord: string, completionEnd: string } {
      var completionWord = ''
      var completionEnd = ''
      if (sel.$from.nodeBefore != null) {
        let val = sel.$from.nodeBefore.textContent
        let p = -1
        for (p = val.length - 1; p >= 0; p--) {
          if (val[p] === ' ' || val[p] === '\n') {
            //Stop on WS
            break
          }
          for (let ti = 0; ti < props.triggers.length; ti++) {
            let t = props.triggers[ti]
            if (val.substring(p, t.length) == t) {
              // we found trigger, -1 to pos
              p -= t.length
              break
            }
          }
        }
        if (p != -1) {
          val = val.substring(p + 1)
        }
        completionWord = val
      }
      if (sel.$from.nodeAfter != null) {
        completionEnd = sel.$from.nodeAfter.textContent
      }
      return { completionWord, completionEnd }
    }

    let state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(element),
      plugins: [
        history(),
        buildInputRules(),
        keymap(buildKeymap()),
      ]
    })
    let emitStyleEvent = function () {
      let sel = view.state.selection
      var { completionWord, completionEnd } = findCompletion(sel)

      let cursor = view.coordsAtPos(sel.from - completionWord.length - 1)
      // The box in which the tooltip is positioned, to use as base

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
        underline: isUnderline, isUnderlineEnabled: Commands.toggleUnderline(view.state, null),
        cursor: { left: cursor.left, top: cursor.top, bottom: cursor.bottom, right: cursor.right },
        completionWord,
        completionEnd,
        selection: { from: sel.from, to: sel.to }
      } as EditorContentEvent
      context.emit("styleEvent", evt)
    }
    let view = new EditorView(editRoot, {
      state,
      dispatchTransaction(transaction) {
        let newState = view.state.apply(transaction)

        // Check and update triggers to update content.
        if (props.transformInjections != null) {
          let tr: Promise<Transaction> = props.transformInjections(newState)
          if (tr != null) {
            tr.then((res) => {
              if (res != null) {
                newState = newState.apply(res)
                view.updateState(newState)

                emitStyleEvent()
              }
            })
          }
        }
        view.updateState(newState)

        emitStyleEvent()
      }
    })

    onMounted(() => {
      root.value.appendChild(editRoot)
    })
    watch(() => props.content, content => {
      if (content != view.dom.innerHTML) {

        const parser = new window.DOMParser()
        const element = parser.parseFromString(props.content, 'text/html').body
        let newDoc = DOMParser.fromSchema(schema).parse(element)

        let op = state.tr.setSelection(new AllSelection(state.doc)).replaceSelectionWith(newDoc)
        let newState = state.apply(op)

        view.updateState(newState)

        view.focus()
      }
    })

    function insert(text: string, from: number, to: number) {
      const t = view.state.tr.insertText(text, from, to)
      const st = view.state.apply(t)
      view.updateState(st)
      emitStyleEvent()
    }
    function insertMark(text: string, from: number, to: number, mark: MarkType, attrs?: { [key: string]: any }) {
      // Ignore white spaces on end of text
      let markLen = text.trim().length

      const t = view.state.tr.insertText(text, from, to).addMark(from, from + markLen, mark.create(attrs))
      const st = view.state.apply(t)
      view.updateState(st)
      emitStyleEvent()
    }
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
      },
      insert,
      insertMark,
      focus() {
        view.focus()
      },
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
@import "~@anticrm/sparkling-theme/css/_variables.scss";
@import "~prosemirror-view/style/prosemirror.css";
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

  .popup-bar {
    display: flex;
    flex-direction: column;
    visibility: hidden;
    background-color: $input-color;
    color: #fff;
    position: absolute;
    border: 1px solid $content-color-dark;
    border-radius: 3px;

    &.show {
      visibility: visible;
    }
    .item {
      font-size: 14px;
      font-family: Raleway;
      white-space: no-wrap;
    }
  }
}
</style>
