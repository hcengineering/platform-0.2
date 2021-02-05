<script lang='ts'>
  import { AnyLayout, StringProperty } from '@anticrm/core'
  import { MessageNode, newMessageDocument } from '@anticrm/text'
  import { _getCoreService } from '../../utils'

  import { CoreService } from '@anticrm/platform-core'

  import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.svelte'
  import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.svelte'

  import EditorContent from '@anticrm/sparkling-rich/src/EditorContent.svelte'
  import { EditorContentEvent } from '@anticrm/sparkling-rich/src/index'
  import { EditorState, Transaction } from 'prosemirror-state'

  import CompletionPopup from './CompletionPopup.svelte'
  import { CompletionItem } from './CompletionPopupHelper'

  import { schema } from '@anticrm/sparkling-rich/src/internal/schema'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import presentation from '@anticrm/presentation'

  import { createEventDispatcher, onDestroy } from 'svelte'
  import { CORE_CLASS_TITLE, Title } from '@anticrm/domains'

  const dispatch = createEventDispatcher()

  // ********************************
  // Properties
  // ********************************
  export let stylesEnabled: boolean = false
  export let height: number = -1

  // ********************************
  // Functionality
  // ********************************
  function startsWith (str: string | undefined, prefix: string) {
    return (str ?? '').startsWith(prefix)
  }

  interface ItemRefefence {
    id: string
    class: string
  }

  interface ExtendedCompletionItem extends CompletionItem, ItemRefefence {
  }

  let styleState: EditorContentEvent = {
    isEmpty: true,
    cursor: {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0
    },
    bold: false,
    italic: false,
    completionWord: '',
    selection: {
      from: 0,
      to: 0
    },
    completionEnd: '',
    inputHeight: 0
  }
  let completions: CompletionItem[] = []
  let editorContent: MessageNode = newMessageDocument()
  let completionControl: CompletionPopup

  let htmlEditor: EditorContent

  let triggers = ['@', '#', '[[']

  let currentPrefix = ''
  let popupVisible = false

  let titleSearch: (query: AnyLayout) => void

  let coreService: CoreService = _getCoreService()

  function query (prefix: string): AnyLayout {
    return {
      title: {
        $regex: prefix + '.*' as StringProperty,
        $options: 'i' as StringProperty
      }
    }
  }

  titleSearch = coreService.subscribe(CORE_CLASS_TITLE, query(currentPrefix), (docs) => {
    completions = updateTitles(docs)
  }, onDestroy)

  $: {
    titleSearch(query(currentPrefix))
  }

  function updateTitles (docs: Title[]): CompletionItem[] {
    let items: CompletionItem[] = []
    for (const value of docs) {
      // if (startsWith(value.title.toString(), currentPrefix)) {
      let kk = value.title
      items.push({
        key: value._objectId,
        label: kk,
        title: kk + ' - ' + value._objectClass,
        class: value._objectClass,
        id: value._objectId
      } as ExtendedCompletionItem)
      // }
    }
    return items
  }

  async function findTitle (title: string): Promise<ItemRefefence[]> {
    let docs = await coreService.find(CORE_CLASS_TITLE, {
      title: title as StringProperty
    })

    for (const value of docs) {
      if (value.title === title) {
        return [{
          id: value._objectId,
          class: value._objectClass
        } as ItemRefefence]
      }
    }
    return []
  }

  function updateStyle (event: EditorContentEvent) {
    styleState = event

    if (event.completionWord.length == 0) {
      currentPrefix = ''
      popupVisible = false
      return
    }
    if (event.completionWord.startsWith('[[')) {
      if (event.completionWord.endsWith(']')) {
        popupVisible = false
        currentPrefix = ''
      } else {
        currentPrefix = event.completionWord.substring(2)
        popupVisible = true
      }
    } else {
      currentPrefix = ''
      popupVisible = false
    }
  }

  function handlePopupSelected (value: CompletionItem) {
    let extra = 0
    if (styleState.completionEnd != null && styleState.completionEnd.endsWith(']]')) {
      extra = styleState.completionEnd.length
    }
    let vv = value as ExtendedCompletionItem
    htmlEditor.insertMark(
      '[[' + value.label + ']]',
      styleState.selection.from - styleState.completionWord.length,
      styleState.selection.to + extra,
      schema.marks.reference,
      {
        id: vv.id,
        class: vv.class
      }
    )
    htmlEditor.focus()
  }

  function handleSubmit () {
    if (!styleState.isEmpty) {
      dispatch('message', editorContent)
    }
    editorContent = newMessageDocument()
  }

  function onKeyDown (event: any) {
    if (popupVisible > 0) {
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
        popupVisible = false
        return
      }
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSubmit()
      event.preventDefault()
    }
  }

  function transformInjections (state: EditorState): Promise<Transaction | null> {
    let operations: ((tr: Transaction | null) => Transaction)[] = []
    let promises: Promise<void>[] = []

    state.doc.descendants((node, pos) => {
      if (node.isText && node.text != null) {
        let prev = {
          id: '',
          class: ''
        } as ItemRefefence
        // Check we had our reference marl
        // Check if we had trigger words without defined marker
        for (let i = 0; i < node.marks.length; i++) {
          if (node.marks[i].type == schema.marks.reference) {
            prev = {
              id: node.marks[i].attrs.id,
              class: node.marks[i].attrs.class
            }
            break
          }
        }

        const len = node.text.length
        let i = 0
        while (i < len) {
          if (node.text.startsWith('[[', i)) {
            // We found trigger, we need to call replace method
            let endpos = node.text.indexOf(']]', i)
            if (endpos !== -1) {
              let end = endpos + 2

              let refText = node.text.substring(i + 2, end - 2)
              let ci = i
              let cpos = pos
              let cend = end
              promises.push(
                Promise.all([findTitle(refText)]).then((result) => {
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
                        return (tr == null ? state.tr : tr).addMark(cpos + ci, cpos + cend, mark)
                      }
                    )
                  } else if (items.length == 0) {
                    if (prev.id == '') {
                      operations.push(
                        (tr: Transaction | null): Transaction => {
                          let mark = schema.marks.reference.create({
                            id: null,
                            class: 'Page'
                          })
                          return (tr == null ? state.tr : tr).addMark(cpos + ci, cpos + cend, mark)
                        }
                      )
                    }
                  }
                })
              )
              i = end // Move to next char after ]]
              continue
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

<style lang='scss'>
  .presentation-reference-input-control {
    width: 100%;

    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 8px;
    box-sizing: border-box;

    yarn .flex-column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .flex-row {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }

    .edit-box-horizontal {
      width: 100%;
      height: 100%;
      margin-top: 7px;
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

    :global {
      reference {
        color: lightblue;
      }

      reference:not([id]) {
        color: grey;
      }
    }

    .tSeparator {
      width: 2px;
      height: 42px;
      margin: 0 8px;
      background-color: var(--theme-bg-accent-color);
    }
  }
</style>

<div class='presentation-reference-input-control'>
  <slot name='top' />
  <div>
    <div class:flex-column={stylesEnabled} class:flex-row={!stylesEnabled}>
      {#if !stylesEnabled}
        <Toolbar>
          <slot name='inner' />
        </Toolbar>
      {/if}

      <div
        class:edit-box-vertical={stylesEnabled}
        class:edit-box-horizontal={!stylesEnabled}
        on:keydown={onKeyDown}
        style={`height: ${height > 0 ? height + 'px' : ''}`}>
        <EditorContent
          bind:this={htmlEditor}
          bind:content={editorContent}
          {triggers}
          {transformInjections}
          on:content={(event) => {
            editorContent = event.detail
          }}
          on:styleEvent={(e) => updateStyle(e.detail)}>
          {#if popupVisible}
            <CompletionPopup
              bind:this={completionControl}
              on:blur={(e) => (completions = [])}
              ontop={true}
              items={completions}
              pos={{ left: styleState.cursor.left + 15, top: styleState.cursor.top - styleState.inputHeight, right: styleState.cursor.right + 15, bottom: styleState.cursor.bottom - styleState.inputHeight }}
              on:select={(e) => handlePopupSelected(e.detail)} />
          {/if}
        </EditorContent>
      </div>

      {#if stylesEnabled}
        <div class='separator' />
      {/if}
      <Toolbar>
        {#if stylesEnabled}
          <slot name='inner' />
          <ToolbarButton style='padding:0; width:24px; height:24px'
                         on:click={() => htmlEditor.toggleBold()} selected={styleState.bold}>
            <Icon icon={presentation.icon.brdBold} clazz='icon-brd' />
          </ToolbarButton>
          <ToolbarButton style='padding:0; width:24px; height:24px'
                         on:click={() => htmlEditor.toggleItalic()}
                         selected={styleState.italic}>
            <Icon icon={presentation.icon.brdItalic} clazz='icon-brd' />
          </ToolbarButton>
          <div class='tSeparator' />
          <ToolbarButton style='padding:0; width:24px; height:24px'>
            <Icon icon={presentation.icon.brdCode} clazz='icon-brd' />
          </ToolbarButton>
          <ToolbarButton style='padding:0; width:24px; height:24px'
                         on:click={() => htmlEditor.toggleUnOrderedList()}>
            <Icon icon={presentation.icon.brdUL} clazz='icon-brd' />
          </ToolbarButton>
          <ToolbarButton style='padding:0; width:24px; height:24px'
                         on:click={() => htmlEditor.toggleOrderedList()}>
            <Icon icon={presentation.icon.brdOL} clazz='icon-brd' />
          </ToolbarButton>
          <div class='tSeparator' />
          <ToolbarButton style='padding:0; width:24px; height:24px'>
            <Icon icon={presentation.icon.brdLink} clazz='icon-brd' />
          </ToolbarButton>
          <div class='tSeparator' />
          <ToolbarButton style='padding:0; width:24px; height:24px'>
            <Icon icon={presentation.icon.brdAddr} clazz='icon-brd' />
          </ToolbarButton>
          <ToolbarButton style='padding:0; width:24px; height:24px'>
            <Icon icon={presentation.icon.brdClip} clazz='icon-brd' />
          </ToolbarButton>
        {/if}
        <div slot='right'>
          <ToolbarButton style='padding:0; width:42x; height:42px'
                         on:click={() => handleSubmit()} selected={!styleState.isEmpty}>
            <Icon icon={presentation.icon.brdSend} clazz='icon-brd-max' />
            <!--▶️-->
          </ToolbarButton>
          <ToolbarButton style='padding:0; width:42px; height:42px'>
            <Icon icon={presentation.icon.brdSmile} clazz='icon-brd-max' />
            <!--😀-->
          </ToolbarButton>
          <ToolbarButton style='font-weight:bold' selected={stylesEnabled}
                         on:click={() => (stylesEnabled = !stylesEnabled)}>Aa
          </ToolbarButton>
        </div>
      </Toolbar>
    </div>
  </div>
</div>
