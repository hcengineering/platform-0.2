import { toggleMark } from 'prosemirror-commands'
import { wrapInList } from 'prosemirror-schema-list'

import { schema } from './schema'

export const Commands = {
  toggleStrong: toggleMark(schema.marks.strong),
  toggleItalic: toggleMark(schema.marks.em),
  toggleStrike: toggleMark(schema.marks.strike),
  toggleUnderline: toggleMark(schema.marks.underline),
  toggleOrdered: wrapInList(schema.nodes.ordered_list),
  toggleUnOrdered: wrapInList(schema.nodes.bullet_list)
}
