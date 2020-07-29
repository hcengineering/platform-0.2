import {
    inputRules, wrappingInputRule, textblockTypeInputRule,
    smartQuotes, emDash, ellipsis
} from "prosemirror-inputrules"

import { schema } from "./schema"

import { NodeType } from "prosemirror-model"

function blockQuoteRule(nodeType: NodeType) {
    return wrappingInputRule(/^\s*>\s$/, nodeType)
}

function orderedListRule(nodeType: NodeType) {
    return wrappingInputRule(/^(\d+)\.\s$/, nodeType, match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order == +match[1])
}


function bulletListRule(nodeType: NodeType) {
    return wrappingInputRule(/^\s*([-+*])\s$/, nodeType)
}


function codeBlockRule(nodeType: NodeType) {
    return textblockTypeInputRule(/^```$/, nodeType)
}

export function buildInputRules() {
    let rules = smartQuotes.concat(ellipsis, emDash), type
    if (type = schema.nodes.blockquote) rules.push(blockQuoteRule(type))
    if (type = schema.nodes.ordered_list) rules.push(orderedListRule(type))
    if (type = schema.nodes.bullet_list) rules.push(bulletListRule(type))
    if (type = schema.nodes.code_block) rules.push(codeBlockRule(type))
    return inputRules({ rules })
}
