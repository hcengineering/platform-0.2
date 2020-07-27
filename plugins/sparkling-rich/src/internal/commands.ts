import {
    chainCommands, toggleMark, exitCode,
    joinUp, joinDown, lift, selectParentNode,
} from "prosemirror-commands"

import { schema } from "./schema"

export let Commands = {
    toggleStrong: toggleMark(schema.marks.strong),
    toggleItalic: toggleMark(schema.marks.em),
    toggleStrike: toggleMark(schema.marks.strike),
}
