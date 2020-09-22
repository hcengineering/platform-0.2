import {
  ellipsis,
  emDash,
  InputRule,
  inputRules,
  smartQuotes,
  textblockTypeInputRule,
  wrappingInputRule
} from 'prosemirror-inputrules'

import { schema } from './schema'

import { NodeType } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'

function blockQuoteRule (nodeType: NodeType): InputRule {
  return wrappingInputRule(/^\s*>\s$/, nodeType)
}

function orderedListRule (nodeType: NodeType): InputRule {
  return wrappingInputRule(/^(\d+)\.\s$/, nodeType, match => ({ order: +match[1] }),
    (match, node) => node.childCount + (node.attrs.order as number) === +match[1])
}

function bulletListRule (nodeType: NodeType): InputRule {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType)
}

function codeBlockRule (nodeType: NodeType): InputRule {
  return textblockTypeInputRule(/^```$/, nodeType)
}

export function buildInputRules (): Plugin {
  const rules = smartQuotes.concat(ellipsis, emDash)
  rules.push(blockQuoteRule(schema.nodes.blockquote))
  rules.push(orderedListRule(schema.nodes.ordered_list))
  rules.push(bulletListRule(schema.nodes.bullet_list))
  rules.push(codeBlockRule(schema.nodes.code_block))
  return inputRules({ rules })
}
