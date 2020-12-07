import { redo, undo } from 'prosemirror-history'
import {
  chainCommands,
  exitCode,
  joinDown,
  joinUp,
  lift
} from 'prosemirror-commands'

import { EditorState } from 'prosemirror-state'

import { undoInputRule } from 'prosemirror-inputrules'

import {
  liftListItem,
  sinkListItem,
  splitListItem
} from 'prosemirror-schema-list'

import { schema } from './schema'
import { Commands } from './commands'

const mac =
  typeof navigator !== 'undefined' ? navigator.platform.includes('Mac') : false

export function buildKeymap (): { [key: string]: any } {
  const keys: { [key: string]: any } = {}

  const bind = (key: string, cmd: any): void => {
    keys[key] = cmd
  }

  bind('Mod-z', undo)
  bind('Shift-Mod-z', redo)

  const bsRule = chainCommands((state: EditorState, dispatch: any) => {
    if (liftListItem(schema.nodes.list_item)(state)) {
      if (state.selection.$from.nodeBefore?.text === undefined) {
        liftListItem(schema.nodes.list_item)(state, dispatch)

        return true
      }
    }
    return false
  }, undoInputRule)
  bind('Backspace', bsRule)

  if (!mac) bind('Mod-y', redo)

  bind('Alt-ArrowUp', joinUp)
  bind('Alt-ArrowDown', joinDown)

  bind('Mod-BracketLeft', lift)

  bind('Mod-b', Commands.toggleStrong)
  bind('Mod-B', Commands.toggleStrong)

  bind('Mod-i', Commands.toggleItalic)
  bind('Mod-I', Commands.toggleItalic)

  const br = schema.nodes.hard_break
  const cmd = chainCommands(exitCode, (state: EditorState, dispatch: any) => {
    if (splitListItem(schema.nodes.list_item)(state)) {
      splitListItem(schema.nodes.list_item)(state, dispatch)
      return true
    }
    dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
    return true
  })
  bind('Mod-Enter', cmd)
  bind('Shift-Enter', cmd)
  if (mac) bind('Ctrl-Enter', cmd)

  // bind('Shift-Enter', splitListItem(schema.nodes.list_item))
  bind('Mod-[', liftListItem(schema.nodes.list_item))
  bind('Mod-]', sinkListItem(schema.nodes.list_item))

  return keys
}
