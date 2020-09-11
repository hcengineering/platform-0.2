import { redo, undo } from 'prosemirror-history'
import { chainCommands, exitCode, joinDown, joinUp, lift } from 'prosemirror-commands'

import { EditorState } from 'prosemirror-state'

import { undoInputRule } from 'prosemirror-inputrules'

import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'

import { schema } from './schema'
import { Commands } from './commands'

const mac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false

export function buildKeymap () {
  const keys: { [key: string]: any } = {}

  function bind (key: string, cmd: any) {
    keys[key] = cmd
  }

  bind('Mod-z', undo)
  bind('Shift-Mod-z', redo)
  bind('Backspace', undoInputRule)
  if (!mac) bind('Mod-y', redo)

  bind('Alt-ArrowUp', joinUp)
  bind('Alt-ArrowDown', joinDown)

  bind('Mod-BracketLeft', lift)

  bind('Mod-b', Commands.toggleStrong)
  bind('Mod-B', Commands.toggleStrong)

  bind('Mod-i', Commands.toggleItalic)
  bind('Mod-I', Commands.toggleItalic)

  const br = schema.nodes.hard_break; const cmd = chainCommands(exitCode, (state: EditorState, dispatch: any) => {
    dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
    return true
  })
  bind('Mod-Enter', cmd)
  bind('Shift-Enter', cmd)
  if (mac) bind('Ctrl-Enter', cmd)

  bind('Enter', splitListItem(schema.nodes.list_item))
  bind('Mod-[', liftListItem(schema.nodes.list_item))
  bind('Mod-]', sinkListItem(schema.nodes.list_item))

  return keys
}
