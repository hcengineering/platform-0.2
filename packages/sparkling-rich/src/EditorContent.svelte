<script lang="ts">
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

  import { createEventDispatcher, onMount } from 'svelte'

  const dispatch = createEventDispatcher()

  const mac =
    typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false

  export let content: string = ''
  export let hoverMessage: string = 'Placeholder...'
  export let triggers: string[] = []
  export let transformInjections: (
    state: EditorState
  ) => Promise<Transaction | null>

  // Perform update of values are changed
  $: updateValue(content)

  // Internal variables
  let view: EditorView
  let state: EditorState
  let root: HTMLElement

  let rootElement: HTMLElement

  let inputHeight: number

  let isEmpty: boolean = checkEmpty(content)

  function checkEmpty(value: string): boolean {
    return value.length === 0 || value === '<p><br></p>' || value === '<p></p>'
  }

  function findCompletion(
    sel: any
  ): { completionWord: string; completionEnd: string } {
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
        for (let ti = 0; ti < triggers.length; ti++) {
          let t = triggers[ti]
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

  function emitStyleEvent() {
    let sel = view.state.selection
    var { completionWord, completionEnd } = findCompletion(sel)

    let posAtWindow = view.coordsAtPos(sel.from - completionWord.length - 1)

    var viewportOffset = rootElement.getBoundingClientRect()

    let cursor = {
      left: posAtWindow.left - viewportOffset.left,
      top: posAtWindow.top - viewportOffset.top,
      right: posAtWindow.right - viewportOffset.left,
      bottom: posAtWindow.bottom - viewportOffset.top
    }
    console.log('Cursor:', cursor)
    // The box in which the tooltip is positioned, to use as base

    let innerDOMValue = view.dom.innerHTML
    dispatch('content', innerDOMValue)

    // Check types
    let marks = view.state.storedMarks || view.state.selection.$from.marks()

    let isBold = schema.marks.strong.isInSet(marks) != null
    let isItalic = schema.marks.em.isInSet(marks) != null
    let isStrike = schema.marks.strike.isInSet(marks) != null
    let isUnderline = schema.marks.underline.isInSet(marks) != null
    isEmpty = checkEmpty(innerDOMValue)
    let evt = {
      isEmpty: isEmpty,
      bold: isBold,
      isBoldEnabled: Commands.toggleStrong(view.state),
      italic: isItalic,
      isItalicEnabled: Commands.toggleItalic(view.state),
      strike: isStrike,
      isStrikeEnabled: Commands.toggleStrike(view.state),
      underline: isUnderline,
      isUnderlineEnabled: Commands.toggleUnderline(view.state),
      cursor: {
        left: cursor.left,
        top: cursor.top,
        bottom: cursor.bottom,
        right: cursor.right
      },
      completionWord,
      completionEnd,
      selection: { from: sel.from, to: sel.to },
      inputHeight
    } as EditorContentEvent
    dispatch('styleEvent', evt)
  }

  //****************************************************************
  // Initialization of prosemirror stuff.
  //****************************************************************
  rootElement = document.createElement('div')

  const parser = new window.DOMParser()
  const element = parser.parseFromString(content, 'text/html').body

  state = EditorState.create({
    schema,
    doc: DOMParser.fromSchema(schema).parse(element),
    plugins: [history(), buildInputRules(), keymap(buildKeymap())]
  })
  view = new EditorView(rootElement, {
    state,
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction)

      // Check and update triggers to update content.
      if (transformInjections != null) {
        let tr: Promise<Transaction | null> = transformInjections(newState)
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

  onMount(() => {
    root.appendChild(rootElement)
  })

  function updateValue(content: string) {
    if (content != view.dom.innerHTML) {
      const element = parser.parseFromString(content, 'text/html').body
      let newDoc = DOMParser.fromSchema(schema).parse(element)

      let op = state.tr
        .setSelection(new AllSelection(state.doc))
        .replaceSelectionWith(newDoc)
      let newState = state.apply(op)

      view.updateState(newState)

      view.focus()
    }
  }

  export function insert(text: string, from: number, to: number) {
    const t = view.state.tr.insertText(text, from, to)
    const st = view.state.apply(t)
    view.updateState(st)
    emitStyleEvent()
  }

  export function insertMark(
    text: string,
    from: number,
    to: number,
    mark: MarkType,
    attrs?: { [key: string]: any }
  ) {
    // Ignore white spaces on end of text
    let markLen = text.trim().length

    const t = view.state.tr
      .insertText(text, from, to)
      .addMark(from, from + markLen, mark.create(attrs))
    const st = view.state.apply(t)
    view.updateState(st)
    emitStyleEvent()
  }
  // Some operations
  export function toggleBold() {
    Commands.toggleStrong(view.state, view.dispatch)
    view.focus()
  }
  export function toggleItalic() {
    Commands.toggleItalic(view.state, view.dispatch)
    view.focus()
  }
  export function toggleStrike() {
    Commands.toggleStrike(view.state, view.dispatch)
    view.focus()
  }
  export function toggleUnderline() {
    Commands.toggleUnderline(view.state, view.dispatch)
    view.focus()
  }
  export function toggleUnOrderedList() {
    Commands.toggleUnOrdered(view.state, view.dispatch)
    view.focus()
  }
  export function toggleOrderedList() {
    Commands.toggleOrdered(view.state, view.dispatch)
    view.focus()
  }
  export function focus() {
    view.focus()
  }
</script>

<div
  class="edit-box"
  bind:this="{root}"
  bind:clientHeight="{inputHeight}"
></div>
<div
  class="hover-message"
  style="{`top:${-1 * inputHeight}px;` +  //
    `margin-bottom:${-1 * inputHeight}px;` +  //
    `height:${inputHeight}px`}"
>
  {#if isEmpty}{hoverMessage}{/if}
</div>
<slot />

<style lang="scss">
  :global {
    .ProseMirror {
      position: relative;
    }

    .ProseMirror {
      word-wrap: break-word;
      white-space: pre-wrap;
      white-space: break-spaces;
      -webkit-font-variant-ligatures: none;
      font-variant-ligatures: none;
      font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */
    }

    .ProseMirror pre {
      white-space: pre-wrap;
    }

    .ProseMirror li {
      position: relative;
    }

    .ProseMirror-hideselection *::selection {
      background: transparent;
    }
    .ProseMirror-hideselection *::-moz-selection {
      background: transparent;
    }
    .ProseMirror-hideselection {
      caret-color: transparent;
    }

    .ProseMirror-selectednode {
      outline: 2px solid #8cf;
    }

    /* Make sure li selections wrap around markers */

    li.ProseMirror-selectednode {
      outline: none;
    }

    li.ProseMirror-selectednode:after {
      content: '';
      position: absolute;
      left: -32px;
      right: -2px;
      top: -2px;
      bottom: -2px;
      border: 2px solid #8cf;
      pointer-events: none;
    }
  }

  .edit-box {
    overflow: auto;
    height: 100%;
    width: 100%;
    position: relative;

    :global {
      div {
        outline: none;
        p {
          margin: 5px;
        }
      }
    }
  }
  .edit-box:focus {
    outline: none;
  }
  .hover-message {
    position: relative;
    top: 0px;
    pointer-events: none;
    padding-left: 5px;
    padding-top: 5px;
    color: #aaaaaa;
  }
</style>
