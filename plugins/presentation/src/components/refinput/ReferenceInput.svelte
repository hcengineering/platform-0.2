<script lang="ts">
  import { Class, Ref, VDoc, StringProperty } from '@anticrm/core'
  import {
    getCoreService,
    getPresentationService,
    getEmptyModel
  } from '../../utils'

  import { ClassModel } from '../..'

  import core from '@anticrm/platform-core'
  import pcore from '../../index'

  import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.svelte'
  import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.svelte'

  import EditorContent from '@anticrm/sparkling-rich/src/EditorContent.svelte'
  import { EditorContentEvent } from '@anticrm/sparkling-rich/src/index'

  import { CoreService } from '@anticrm/platform-core'
  import { EditorState, Transaction } from 'prosemirror-state'

  import CompletionPopup from './CompletionPopup.svelte'
  import { CompletionItem } from './CompletionPopupHelper'

  import { schema } from '@anticrm/sparkling-rich/src/internal/schema'

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  function startsWith(str: string | undefined, prefix: string) {
    return (str ?? '').startsWith(prefix)
  }

  interface ItemRefefence {
    id: string
    class: string
  }

  interface ExtendedCompletionItem extends CompletionItem, ItemRefefence {}

  let coreS: CoreService

  $: getCoreService().then((s) => {
    coreS = s
  })

  let styleState: EditorContentEvent = {
    isEmpty: true,
    cursor: { left: 0, top: 0, bottom: 0, right: 0 },
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    completionWord: '',
    selection: { from: 0, to: 0 },
		completionEnd: '',
		inputHeight: 0
  }
  let completions: CompletionItem[] = []
  let htmlValue: string = ''
  export let stylesEnabled: boolean = false
  let completionControl: CompletionPopup

  let htmlEditor: EditorContent

  let triggers = ['@', '#', '[[']

  async function findSpaces(userPrefix: string): Promise<CompletionItem[]> {
    let model = coreS.getModel()
    let docs = await model.find(core.class.Space, {})

    let items: CompletionItem[] = []
    const all = model.cast(docs, pcore.mixin.UXObject)
    for (const value of all) {
      if (startsWith(value.label, userPrefix) && value.label !== userPrefix) {
        let kk = value._id
        items.push({
          key: kk,
          label: kk,
          title: kk + ' - Space',
          class: core.class.Space,
          id: value._id
        } as ExtendedCompletionItem)
      }
    }
    return items
  }
  async function findSpace(title: string): Promise<ItemRefefence[]> {
    let docs = await coreS.getModel().find(pcore.mixin.UXObject, {
      label: title as StringProperty
    })
    return docs.map((e) => {
      return { id: e._id, class: e._class } as ItemRefefence
    })
  }
  function updateStyle(event: EditorContentEvent) {
    styleState = event

    if (event.completionWord.length == 0) {
      completions = []
      return
    }
    let word = event.completionWord
    if (word.startsWith('@')) {
      // findUsers(word.substring(1)).then((items) => {
      //   completions.value = {
      //     items: items
      //   }
      // })
      completions = [
        {
          key: 'u1',
          label: 'andrey',
          title: 'andrey' + ' - User',
          class: core.class.Space,
          id: 'id1'
        } as CompletionItem,
        {
          key: 'u1',
          label: 'haiodo',
          title: 'haiodo' + ' - User',
          class: core.class.Space,
          id: 'id2'
        } as CompletionItem
      ]
    } else if (word.startsWith('#')) {
      findSpaces(word.substring(1)).then((items) => {
        completions = items
      })
    } else if (event.completionWord.startsWith('[[')) {
      const userPrefix = event.completionWord.substring(2)

      Promise.all([
        findSpaces(userPrefix)
        // findUsers(userPrefix),
        // findPages(userPrefix),
      ]).then((result) => {
        completions = result.reduce((acc, val) => {
          return acc.concat(val)
        }, [])
      })
    } else {
      completions = []
    }
  }
  function handlePopupSelected(value: CompletionItem) {
    let extra = 0
    if (
      styleState.completionEnd != null &&
      styleState.completionEnd.endsWith(']]')
    ) {
      extra = styleState.completionEnd.length
    }
    let vv = value as ExtendedCompletionItem
    htmlEditor.insertMark(
      '[[' + value.label + ']] ',
      styleState.selection.from - styleState.completionWord.length,
      styleState.selection.to + extra,
      schema.marks.reference,
      { id: vv.id, class: vv.class }
    )
    htmlEditor.focus()
  }
  function handleSubmit() {
    if (!styleState.isEmpty) {
      dispatch('message', htmlValue)
    }
    htmlValue = ''
  }
  function onKeyDown(event: any) {
    if (completions.length > 0) {
      if (event.key === 'ArrowUp') {
        completionControl.handleUp()
        event.preventDefault()
        return
      }
      if (event.key === 'ArrowDown') {
        completionControl.handleDown()
        event.preventDefault()
        return
      }
      if (event.key === 'Enter') {
        completionControl.handleSubmit()
        event.preventDefault()
        return
      }
      if (event.key === 'Escape') {
        completions = []
        return
      }
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSubmit()
      event.preventDefault()
    }
  }
  function transformInjections(
    state: EditorState
  ): Promise<Transaction | null> {
    let operations: ((tr: Transaction | null) => Transaction)[] = []
    let promises: Promise<void>[] = []

    state.doc.descendants((node, pos) => {
      if (node.isText && node.text != null) {
        let prev = { id: '', class: '' } as ItemRefefence
        // Check we had our reference marl
        // Check if we had trigger words without defined marker
        for (let i = 0; i < node.marks.length; i++) {
          if (node.marks[i].type == schema.marks.reference) {
            // We had our mark already, check if it name fit with document type
            // If not fit we need to covert it to Page type.
            if (!node.text.startsWith('[[') || !node.text.endsWith(']]')) {
              operations.push((tr) => {
                return (tr == null ? state.tr : tr).removeMark(
                  pos,
                  pos + node.nodeSize,
                  node.marks[i]
                )
              })
            }
            prev = { id: node.attrs.id, class: node.attrs.class }
            break
          }
        }

        const len = node.text.length
        let i = 0
        while (i < len) {
          let text = node.text.substring(i)
          if (text.startsWith('[[')) {
            // We found trigger, we need to call replace method
            let endpos = text.indexOf(']]')
            if (endpos !== -1) {
              let end = endpos + 2
              if (end !== i) {
                let refText = node.text.substring(i + 2, i + end - 2)
                let ci = i
                let cpos = pos
                let cend = end
                promises.push(
                  Promise.all([
                    // findUser(refText),
                    // findPage(refText),
                    findSpace(refText)
                  ]).then((result) => {
                    let items = result.reduce((acc, val) => {
                      return acc.concat(val)
                    }, [])
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
                      operations.push(
                        (tr: Transaction | null): Transaction => {
                          let mark = schema.marks.reference.create(items[0])
                          return (tr == null ? state.tr : tr).addMark(
                            cpos + ci,
                            cpos + ci + cend,
                            mark
                          )
                        }
                      )
                    } else if (items.length == 0) {
                      operations.push(
                        (tr: Transaction | null): Transaction => {
                          let mark = schema.marks.reference.create({
                            id: null,
                            class: 'Page'
                          })
                          return (tr == null ? state.tr : tr).addMark(
                            cpos + ci,
                            cpos + ci + cend,
                            mark
                          )
                        }
                      )
                    }
                  })
                )
                i += end // Move to next char after ]]
                continue
              }
            }
          }
          i++
        }
      }
    })

    return Promise.all(promises).then(() => {
      let tr: Transaction | null = null
      for (let i = 0; i < operations.length; i++) {
        let t = operations[i]
        if (t != null) {
          tr = t(tr)
        }
      }
      return tr
    })
  }
</script>

<div class="presentation-reference-input-control">
  <slot name="top" />
  <div>
    <div class:flex-column="{stylesEnabled}" class:flex-row="{!stylesEnabled}">
      {#if !stylesEnabled}
        <Toolbar>
          <slot name="inner" />
        </Toolbar>
      {/if}

      <div
        class:edit-box-vertical="{stylesEnabled}"
        class:edit-box-horizontal="{!stylesEnabled}"
        on:keydown="{onKeyDown}"
      >
        <EditorContent
          bind:this="{htmlEditor}"
          bind:content="{htmlValue}"
          triggers="{triggers}"
          transformInjections="{transformInjections}"
          on:content="{(event) => (htmlValue = event.detail)}"
          on:styleEvent="{(e) => updateStyle(e.detail)}"
        >
          {#if completions.length > 0}
            <CompletionPopup
              bind:this="{completionControl}"
              on:blur="{(e) => (completions = [])}"
              ontop="{true}"
              items="{completions}"
              pos="{{ left: styleState.cursor.left + 15, top: styleState.cursor.top - styleState.inputHeight, right: styleState.cursor.right + 15, bottom: styleState.cursor.bottom - styleState.inputHeight }}"
              on:select="{(e) => handlePopupSelected(e.detail)}"
            />
          {/if}
        </EditorContent>
      </div>

      {#if stylesEnabled}
        <div class="separator"></div>
      {/if}
      <Toolbar>
        {#if stylesEnabled}
          <slot name="inner" />
          <ToolbarButton
            style="font-weight:bold;"
            on:click="{() => htmlEditor.toggleBold()}"
            selected="{styleState.bold}"
          >
            B
          </ToolbarButton>
          <ToolbarButton
            on:click="{() => htmlEditor.toggleItalic()}"
            style="font-weight:italic;"
            selected="{styleState.italic}"
          >
            I
          </ToolbarButton>
          <ToolbarButton
            on:click="{() => htmlEditor.toggleUnderline()}"
            style="font-weight:underline;"
            selected="{styleState.underline}"
          >
            U
          </ToolbarButton>
          <ToolbarButton
            on:click="{() => htmlEditor.toggleStrike()}"
            selected="{styleState.strike}"
          >
            ~
          </ToolbarButton>
          <ToolbarButton on:click="{() => htmlEditor.toggleUnOrderedList()}">
            L
          </ToolbarButton>
          <ToolbarButton on:click="{() => htmlEditor.toggleOrderedList()}">
            O
          </ToolbarButton>
        {/if}
        <div slot="right">
          <ToolbarButton
            on:click="{() => handleSubmit()}"
            selected="{!styleState.isEmpty}"
          >
            ▶️
          </ToolbarButton>
          <ToolbarButton>😀</ToolbarButton>
          <ToolbarButton on:click="{() => (stylesEnabled = !stylesEnabled)}">
            Aa
          </ToolbarButton>
        </div>
      </Toolbar>
    </div>
  </div>
</div>

<style lang="scss">
  .presentation-reference-input-control {
    width: 100%;

    background-color: var(--theme-input-color);
    border: 1px solid var(--theme-content-color-dark);
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
      margin: 4px;
    }
    .edit-box {
      max-height: 300px;
    }
    reference {
      color: lightblue;
    }
    reference:not([id]) {
      color: grey;
    }
  }
</style>
