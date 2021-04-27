//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
//

const MarkdownIt = require('markdown-it') // eslint-disable-line

export enum MessageNodeType {
  doc = 'doc',
  paragraph = 'paragraph',
  blockquote = 'blockquote',
  horizontal_rule = 'horizontal_rule', // eslint-disable-line
  heading = 'heading',
  code_block = 'code_block', // eslint-disable-line
  text = 'text',
  image = 'image',
  hard_break = 'hard_break', // eslint-disable-line
  ordered_list = 'ordered_list', // eslint-disable-line
  bullet_list = 'bullet_list', // eslint-disable-line
  list_item = 'list_item'// eslint-disable-line
}

export enum MessageMarkType {
  link = 'link',
  em = 'em',
  strong = 'strong',
  code = 'code',
  reference = 'reference'
}

export interface MessageMark {
  type: MessageMarkType
  attrs: { [key: string]: any } // A map of attributes
}

export interface MessageNode {
  type: MessageNodeType
  content?: MessageNode[] // A list of child nodes
  marks?: MessageMark[]
  attrs?: { [key: string]: string }
  text?: string
}

interface ParsingRule {
  block?: MessageNodeType
  getAttrs?: (tok: any) => any
  noCloseToken?: boolean
  node?: MessageNodeType
  mark?: MessageMarkType
}
export type FirstDelim = (i: number) => string
export interface IState {
  wrapBlock: (delim: string, firstDelim: string | null, node: MessageNode, f: () => void) => void
  flushClose: (size: number) => void
  atBlank: () => void
  ensureNewLine: () => void
  write: (content: string) => void
  closeBlock: (node: any) => void
  text: (text: string, escape?: boolean) => void
  render: (node: MessageNode, parent: MessageNode, index: number) => void
  renderContent: (parent: MessageNode) => void
  renderInline: (parent: MessageNode) => void
  renderList: (node: MessageNode, delim: string, firstDelim: FirstDelim) => void
  esc: (str: string, startOfLine?: boolean) => string
  quote: (str: string) => string
  repeat: (str: string, n: number) => string
  markString: (mark: MessageMark, open: boolean, parent: MessageNode, index: number) => string
  getEnclosingWhitespace: (text: string) => { leading: string, trailing: string }
}

export function traverseMessage (node: MessageNode, f: (el: MessageNode) => void): void {
  f(node)
  if (node.content !== undefined && node.content !== undefined) {
    for (const c of node.content) {
      traverseMessage(c, f)
    }
  }
}

export function traverseMarks (node: MessageNode, f: (el: MessageMark) => void): void {
  if (node.marks !== undefined && node.marks !== undefined) {
    for (const c of node.marks) {
      f(c)
    }
  }
}

function isInSet (mark: MessageMark, marks: MessageMark[]): boolean {
  for (let i = 0; i < marks.length; i++) {
    if (markEq(mark, marks[i])) {
      return true
    }
  }
  return false
}

function addToSet (mark: MessageMark, marks: MessageMark[]): MessageMark[] {
  const result: MessageMark[] = []
  for (let i = 0; i < marks.length; i++) {
    if (markEq(mark, marks[i])) {
      return marks
    }
    result.push(marks[i])
  }
  result.push(mark)
  return result
}

function removeFromSet (markType: MessageMarkType, marks: MessageMark[]): MessageMark[] {
  for (let i = 0; i < marks.length; i++) {
    if (marks[i].type === markType) {
      return marks.slice(0, i).concat(marks.slice(i + 1))
    }
  }
  return marks
}

function sameSet (a: MessageMark[] | undefined, b: MessageMark[] | undefined): boolean {
  if (a === b) return true
  if (a === undefined) return false
  if (b === undefined) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (!markEq(a[i], b[i])) {
      return false
    }
  }
  return true
}

function markEq (first: MessageMark, other: MessageMark): boolean {
  return (
    first === other || (first.type === other.type && compareDeep(first.attrs, other.attrs))
  )
}

export function compareDeep (a: any, b: any): boolean {
  if (a === b) return true
  if (!(a !== undefined && typeof a === 'object') || !(b !== undefined && typeof b === 'object')) return false
  const isarray = Array.isArray(a)
  if (Array.isArray(b) !== isarray) return false
  if (isarray) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!compareDeep(a[i], b[i])) return false
    }
  } else {
    for (const p in a) if (!(p in b) || !compareDeep(a[p], b[p])) return false
    for (const p in b) if (!(p in a)) return false
  }
  return true
}

export function messageContent (node: MessageNode): MessageNode[] {
  const result: MessageNode[] = []
  if (node.content !== undefined && node.content !== null) {
    result.push(...node.content)
  }
  return result
}

export function messageMarks (node: MessageNode): MessageMark[] {
  const result: MessageMark[] = []
  if (node.marks !== undefined && node.marks !== null) {
    result.push(...node.marks)
  }
  return result
}

function nodeAttrs (node: MessageNode): { [key: string]: string } {
  if (node.attrs !== undefined) {
    return node.attrs
  }
  return {}
}

function markAttrs (mark: MessageMark): { [key: string]: string } {
  if (mark.attrs !== undefined) {
    return mark.attrs
  }
  return {}
}

export function newMessageDocument (): MessageNode {
  return {
    type: MessageNodeType.doc,
    content: [{ type: MessageNodeType.paragraph }]
  }
}

export interface LinkMark extends MessageMark {
  href: string
  title: string
}

export interface ReferenceMark extends MessageMark {
  attrs: { id: string, class: string }
}

export function parseMessage (message: string): MessageNode {
  return parseMessageMarkdown(message)
}

export function serializeMessage (node: MessageNode): string {
  return serializeMessageMarkdown(node)
}

export function serializeMessageMarkdown (node: MessageNode): string {
  const state = new State(storeNodes, storeMarks, {})
  state.renderContent(node)
  return state.out
}

export function parseMessageMarkdown (message: string): MessageNode {
  const parser = new MarkdownParser()
  return parser.parse(message ?? '')
}

type NodeProcessor = (
  state: IState,
  node: MessageNode,
  parent: MessageNode,
  index: number
) => void

// *************************************************************
// *************************************************************

const storeNodes: { [key: string]: NodeProcessor } = {
  blockquote: (state, node) => {
    state.wrapBlock('> ', null, node, () => state.renderContent(node))
  },
  code_block: (state, node) => {
    state.write('```' + (nodeAttrs(node).params ?? '') + '\n')
    // TODO: Check for node.textContent
    state.text(node.text ?? '', false)
    state.ensureNewLine()
    state.write('```')
    state.closeBlock(node)
  },
  heading: (state, node) => {
    const attrs = nodeAttrs(node)
    state.write(state.repeat('#', attrs.level !== undefined ? Number(attrs.level) : 1) + ' ')
    state.renderInline(node)
    state.closeBlock(node)
  },
  horizontal_rule: (state, node) => {
    state.write(nodeAttrs(node).markup ?? '---')
    state.closeBlock(node)
  },
  bullet_list: (state, node) => {
    state.renderList(node, '  ', () => (nodeAttrs(node).bullet ?? '*') + ' ')
  },
  ordered_list: (state, node) => {
    let start = 1
    if (nodeAttrs(node).order !== undefined) {
      start = Number(nodeAttrs(node).order)
    }
    const maxW = String(start + messageContent(node).length - 1).length
    const space = state.repeat(' ', maxW + 2)
    state.renderList(node, space, (i: number) => {
      const nStr = String(start + i)
      return state.repeat(' ', maxW - nStr.length) + nStr + '. '
    })
  },
  list_item: (state, node) => {
    state.renderContent(node)
  },
  paragraph: (state, node) => {
    state.renderInline(node)
    state.closeBlock(node)
  },

  image: (state, node) => {
    const attrs = nodeAttrs(node)
    state.write(
      '![' +
      state.esc(attrs.alt ?? '') +
      '](' +
      state.esc(attrs.src) +
      (attrs.title !== undefined ? ' ' + state.quote(attrs.title) : '') +
      ')'
    )
  },
  hard_break: (state, node, parent, index) => {
    const content = messageContent(parent)
    for (let i = index + 1; i < content.length; i++) {
      if (content[i].type !== node.type) {
        state.write('\\\n')
        return
      }
    }
  },
  text: (state, node) => {
    // Check if test has reference mark, in this case we need to remove [[]]
    let txt = node.text ?? ''

    traverseMarks(node, (m) => {
      if (m.type === MessageMarkType.reference) {
        if (txt.startsWith('[[') && txt.endsWith(']]')) {
          txt = txt.substring(2, txt.length - 2)
        }
      }
    })
    state.text(txt)
  }
}

interface MarkProcessor {
  open: ((_state: IState, mark: MessageMark, parent: MessageNode, index: number) => string) | string
  close: ((_state: IState, mark: MessageMark, parent: MessageNode, index: number) => string) | string
  mixable: boolean
  expelEnclosingWhitespace: boolean
  escape: boolean
}

const storeMarks: { [key: string]: MarkProcessor } = {
  em: {
    open: '*',
    close: '*',
    mixable: true,
    expelEnclosingWhitespace: true,
    escape: true
  },
  strong: {
    open: '**',
    close: '**',
    mixable: true,
    expelEnclosingWhitespace: true,
    escape: true
  },
  link: {
    open: (state, mark, parent, index) => {
      return isPlainURL(mark, parent, index, 1) ? '<' : '['
    },
    close: (state, mark, parent, index) => {
      return isPlainURL(mark, parent, index, -1)
        ? '>'
        : '](' +
        state.esc(mark.attrs.href) +
        (mark.attrs.title !== undefined ? ' ' + state.quote(mark.attrs.title) : '') +
        ')'
    },
    mixable: false,
    expelEnclosingWhitespace: false,
    escape: true
  },
  reference: {
    open: (state, mark, parent, index) => {
      return isPlainURL(mark, parent, index, 1) ? '<' : '['
    },
    close: (state, mark, parent, index) => {
      return isPlainURL(mark, parent, index, -1)
        ? '>'
        : '](ref://' +
        state.esc(mark.attrs.class).replace('class:', '') +
        '#' +
        state.esc(mark.attrs.id) +
        ')'
    },
    mixable: false,
    expelEnclosingWhitespace: false,
    escape: true
  },
  code: {
    open: (state, mark, parent, index) => {
      return backticksFor(messageContent(parent)[index], -1)
    },
    close: (state, mark, parent, index) => {
      return backticksFor(messageContent(parent)[index - 1], 1)
    },
    mixable: false,
    expelEnclosingWhitespace: false,
    escape: false
  }
}

function backticksFor (node: MessageNode, side: any): string {
  const ticks = /`+/g
  let m: RegExpExecArray | null
  let len = 0
  if (node.type === MessageNodeType.text) {
    while ((m = ticks.exec(node.text ?? '')) !== null) len = Math.max(len, m[0].length)
  }
  let result = len > 0 && side > 0 ? ' `' : '`'
  for (let i = 0; i < len; i++) {
    result += '`'
  }
  if (len > 0 && side < 0) {
    result += ' '
  }
  return result
}

function isPlainURL (link: MessageMark, parent: MessageNode, index: number, side: number): boolean {
  const attrs = markAttrs(link)
  if (attrs.title !== undefined || !/^\w+:/.test(attrs.href)) return false

  const parentContent = messageContent(parent)
  const content = parentContent[index + (side < 0 ? -1 : 0)]
  const marks = messageMarks(content)

  if (
    content.type !== MessageNodeType.text ||
    content.text !== attrs.href ||
    marks[marks.length - 1] !== link
  ) {
    return false
  }
  if (index === (side < 0 ? 1 : parentContent.length - 1)) return true
  const next = parentContent[index + (side < 0 ? -2 : 1)]
  return !isInSet(link, messageMarks(next))
}

class State implements IState {
  nodes: { [key: string]: NodeProcessor }
  marks: { [key: string]: MarkProcessor }
  delim: string
  out: string
  closed: boolean
  closedNode?: MessageNode
  inTightList: boolean
  options: any

  constructor (nodes: any, marks: any, options: any) {
    this.nodes = nodes
    this.marks = marks
    this.delim = this.out = ''
    this.closed = false
    this.inTightList = false

    this.options = options ?? {}
    if (typeof this.options.tightLists === 'undefined') {
      this.options.tightLists = false
    }
  }

  flushClose (size: number): void {
    if (this.closed) {
      if (!this.atBlank()) this.out += '\n'
      if (size == null) size = 2
      if (size > 1) {
        let delimMin = this.delim
        const trim = /\s+$/.exec(delimMin)
        if (trim !== null) delimMin = delimMin.slice(0, delimMin.length - trim[0].length)
        for (let i = 1; i < size; i++) this.out += delimMin + '\n'
      }
      this.closed = false
    }
  }

  wrapBlock (delim: string, firstDelim: string | null, node: MessageNode, f: () => void): void {
    const old = this.delim
    this.write(firstDelim ?? delim)
    this.delim += delim
    f()
    this.delim = old
    this.closeBlock(node)
  }

  atBlank (): boolean {
    return /(^|\n)$/.test(this.out)
  }

  // :: ()
  // Ensure the current content ends with a newline.
  ensureNewLine (): void {
    if (!this.atBlank()) this.out += '\n'
  }

  // :: (?string)
  // Prepare the state for writing output (closing closed paragraphs,
  // adding delimiters, and so on), and then optionally add content
  // (unescaped) to the output.
  write (content: string): void {
    this.flushClose(2)
    if (this.delim !== undefined && this.atBlank()) this.out += this.delim
    if (content.length > 0) this.out += content
  }

  // :: (Node)
  // Close the block for the given node.
  closeBlock (node: MessageNode): void {
    this.closedNode = node
    this.closed = true
  }

  // :: (string, ?bool)
  // Add the given text to the document. When escape is not `false`,
  // it will be escaped.
  text (text: string, escape = false): void {
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const startOfLine = this.atBlank() || this.closed
      this.write('')
      this.out += escape ? this.esc(lines[i], startOfLine) : lines[i]
      if (i !== lines.length - 1) this.out += '\n'
    }
  }

  // :: (Node)
  // Render the given node as a block.
  render (node: MessageNode, parent: MessageNode, index: number): void {
    if (typeof parent === 'number') throw new Error('!')
    if (this.nodes[node.type] === undefined) {
      throw new Error(
        'Token type `' + node.type + '` not supported by Markdown renderer'
      )
    }
    this.nodes[node.type](this, node, parent, index)
  }

  // :: (Node)
  // Render the contents of `parent` as block nodes.
  renderContent (parent: MessageNode): void {
    messageContent(parent).forEach((node: MessageNode, i: number) =>
      this.render(node, parent, i)
    )
  }

  // :: (Node)
  // Render the contents of `parent` as inline content.
  renderInline (parent: MessageNode): void {
    const active: MessageMark[] = []
    let trailing = ''
    const progress = (node: MessageNode | undefined, index: number): void => {
      let marks: MessageMark[] = node?.marks ?? []

      if (node !== undefined && node.type === MessageNodeType.hard_break) {
        marks = marks.filter((m: MessageMark) => {
          if (index + 1 === parent.content?.length) {
            return false
          }
          if (parent.content !== undefined) {
            const next = parent.content[index + 1]
            return isInSet(m, next?.marks ?? []) && (next.type !== MessageNodeType.text || (next.text !== undefined && /\S/.test(next.text)))
          } else {
            return false
          }
        })
      }

      let leading = trailing
      trailing = ''
      // If whitespace has to be expelled from the node, adjust
      // leading and trailing accordingly.
      if (node !== undefined && (node.type === MessageNodeType.text) && marks.some((mark: MessageMark) => {
        const info = this.marks[mark.type]
        return info?.expelEnclosingWhitespace
      }) && node.text !== undefined) {
        const ex = /^(\s*)(.*?)(\s*)$/m.exec(node.text)
        if (ex !== null) {
          const [_, lead, inner, trail] = ex // eslint-disable-line
          leading += lead
          trailing = trail
          if (lead !== '' || trail !== '') {
            node = inner !== undefined ? withText(node, inner) : undefined
            if (node === undefined) marks = active
          }
        }
      }

      const inner: MessageMark | undefined = marks.length > 0 ? marks[marks.length - 1] : undefined
      const noEsc = inner !== undefined && !this.marks[inner.type].escape
      const len = marks.length - (noEsc ? 1 : 0)

      // Try to reorder 'mixable' marks, such as em and strong, which
      // in Markdown may be opened and closed in different order, so
      // that order of the marks for the token matches the order in
      // active.
      outer: for (let i = 0; i < len; i++) { // eslint-disable-line
        const mark = marks[i]
        if (!this.marks[mark.type].mixable) break
        for (let j = 0; j < active.length; j++) {
          const other = active[j]
          if (!this.marks[other.type].mixable) break
          if (markEq(mark, other)) {
            if (i > j) {
              marks = marks
                .slice(0, j)
                .concat(mark)
                .concat(marks.slice(j, i))
                .concat(marks.slice(i + 1, len))
            } else if (j > i) {
              marks = marks
                .slice(0, i)
                .concat(marks.slice(i + 1, j))
                .concat(mark)
                .concat(marks.slice(j, len))
            }
            continue outer // eslint-disable-line
          }
        }
      }

      // Find the prefix of the mark set that didn't change
      let keep = 0
      while (keep < Math.min(active.length, len) && markEq(marks[keep], active[keep])) {
        ++keep
      }

      // Close the marks that need to be closed
      while (keep < active.length) {
        const mark = active.pop()
        if (mark !== undefined) {
          this.text(this.markString(mark, false, parent, index), false)
        }
      }

      // Output any previously expelled trailing whitespace outside the marks
      if (leading !== '') this.text(leading)

      // Open the marks that need to be opened
      if (node !== undefined) {
        while (active.length < len) {
          const add = marks[active.length]
          active.push(add)
          this.text(this.markString(add, true, parent, index), false)
        }

        // Render the node. Special case code marks, since their content
        // may not be escaped.
        if (inner !== undefined && noEsc && (node.type === MessageNodeType.text)) {
          this.text(
            this.markString(inner, true, parent, index) + (node?.text as string) +
            this.markString(inner, false, parent, index + 1),
            false
          )
        } else {
          this.render(node, parent, index)
        }
      }
    }
    messageContent(parent).forEach(progress)
    progress(undefined, 0)
  }

  // :: (Node, string, (number) → string)
  // Render a node's content as a list. `delim` should be the extra
  // indentation added to all lines except the first in an item,
  // `firstDelim` is a function going from an item index to a
  // delimiter for the first line of the item.
  renderList (node: MessageNode, delim: string, firstDelim: FirstDelim): void {
    if (this.closed && this.closedNode?.type === node.type) {
      this.flushClose(3)
    } else if (this.inTightList) this.flushClose(1)

    const isTight: boolean =
      node.attrs !== undefined &&
      (typeof node.attrs.tight !== 'undefined'
        ? node.attrs.tight
        : this.options.tightLists)
    const prevTight = this.inTightList
    this.inTightList = isTight

    messageContent(node).forEach((child: MessageNode, i: number) => {
      if (i > 0 && isTight) this.flushClose(1)
      this.wrapBlock(delim, firstDelim(i), node, () =>
        this.render(child, node, i)
      )
    })
    this.inTightList = prevTight
  }

  // :: (string, ?bool) → string
  // Escape the given string so that it can safely appear in Markdown
  // content. If `startOfLine` is true, also escape characters that
  // has special meaning only at the start of the line.
  esc (str: string, startOfLine = false): string {
    if (str == null) {
      return ''
    }
    str = str.replace(/[`*\\~\[\]]/g, '\\$&') // eslint-disable-line
    if (startOfLine) {
      str = str.replace(/^[:#\-*+]/, '\\$&').replace(/^(\d+)\./, '$1\\.')
    }
    return str
  }

  quote (str: string): string {
    const wrap =
      !str.includes('"') ? '""' : !str.includes('\'') ? '\'\'' : '()'
    return wrap[0] + str + wrap[1]
  }

  // :: (string, number) → string
  // Repeat the given string `n` times.
  repeat (str: string, n: number): string {
    let out = ''
    for (let i = 0; i < n; i++) out += str
    return out
  }

  // : (Mark, bool, string?) → string
  // Get the markdown string for a given opening or closing mark.
  markString (mark: MessageMark, open: boolean, parent: MessageNode, index: number): string {
    const info = this.marks[mark.type]
    const value = open ? info.open : info.close
    return typeof value === 'string' ? value : value(this, mark, parent, index) ?? ''
  }

  // :: (string) → { leading: ?string, trailing: ?string }
  // Get leading and trailing whitespace from a string. Values of
  // leading or trailing property of the return object will be undefined
  // if there is no match.
  getEnclosingWhitespace (text: string): { leading: string, trailing: string } {
    return {
      leading: (text.match(/^(\s+)/) ?? [])[0],
      trailing: (text.match(/(\s+)$/) ?? [])[0]
    }
  }
}

function withText (node: MessageNode, text: string): MessageNode {
  if (node.text === text) {
    return node
  }
  return Object.assign({}, node, { text }) as MessageNode
}

// ****************************************************************
// Mark down parser
// ****************************************************************
function maybeMerge (a: MessageNode, b: MessageNode): MessageNode | undefined {
  if (
    a.type === MessageNodeType.text &&
    b.type === MessageNodeType.text &&
    sameSet(a.marks, b.marks)
  ) {
    return withText(a, (a.text ?? '') + (b.text ?? ''))
  }
  return undefined
}

interface StateElement {
  type: MessageNodeType
  content: MessageNode[]
  attrs: { [key: string]: string }
}

// Object used to track the context of a running parse.
class MarkdownParseState {
  stack: StateElement[]
  marks: MessageMark[]
  tokenHandlers: { [key: string]: any }

  constructor (tokenHandlers: { [key: string]: any }) {
    this.stack = [{
      type: MessageNodeType.doc,
      attrs: {},
      content: []
    }]
    this.marks = []
    this.tokenHandlers = tokenHandlers
  }

  top (): StateElement | undefined {
    return this.stack[this.stack.length - 1]
  }

  push (elt: MessageNode): void {
    if (this.stack.length > 0) {
      const tt = this.top()
      if (tt !== undefined) {
        tt.content.push(elt)
      }
    }
  }

  // : (MessageMark[])
  // Convert linsk to references in case of ref:// schema.
  convertReferences (marks: MessageMark[]): MessageMark[] {
    const result: MessageMark[] = []
    for (let i = 0; i < marks.length; i++) {
      const m = marks[i]
      if (m.type !== MessageMarkType.link) {
        result.push(m)
        continue
      }
      if (m.attrs.href !== undefined) {
        const ref = m.attrs.href as string
        const refPrefix = 'ref://'
        const hashPos = ref.indexOf('#')
        if (ref.startsWith(refPrefix) && hashPos !== -1) {
          // Convert any url with ref to reference mark
          result.push({
            type: MessageMarkType.reference,
            attrs: {
              id: ref.substring(hashPos + 1),
              class: 'class:' + ref.substring(refPrefix.length, hashPos)
            }
          })
        }
      }
    }
    return result
  }

  // : (string)
  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText (text: string | undefined): void {
    if (text === undefined) return
    const top = this.top()
    if (top !== undefined) {
      const nodes = top.content
      const last = nodes[nodes.length - 1]
      const node: MessageNode = {
        type: MessageNodeType.text,
        text: text
      }
      if (this.marks.length > 0) {
        node.marks = this.marks
        node.marks = this.convertReferences(node.marks)
      }

      let merged: MessageNode | undefined
      if (last !== undefined && (merged = maybeMerge(last, node)) !== undefined) {
        nodes[nodes.length - 1] = merged
      } else {
        nodes.push(node)
      }
    }
  }

  // : (Mark)
  // Adds the given mark to the set of active marks.
  openMark (mark: MessageMark): void {
    this.marks = addToSet(mark, this.marks)
  }

  // : (Mark)
  // Removes the given mark from the set of active marks.
  closeMark (mark: MessageMarkType): void {
    this.marks = removeFromSet(mark, this.marks)
  }

  parseTokens (toks: any): void {
    for (let i = 0; i < toks.length; i++) {
      const tok = toks[i]
      const handler: any = this.tokenHandlers[tok.type]
      if (handler === undefined) {
        throw new Error(`Token type '${String(tok.type)} not supported by Markdown parser`)
      }
      handler(this, tok)
    }
  }

  // : (NodeType, ?Object, ?[Node]) → ?Node
  // Add a node at the current position.
  addNode (
    type: MessageNodeType,
    attrs: { [key: string]: string },
    content: MessageNode[] = []
  ): MessageNode {
    const node: MessageNode = {
      type: type,
      content: content
    }
    if (attrs !== undefined && Object.keys(attrs).length > 0) {
      node.attrs = attrs
    }
    if (this.marks.length > 0) {
      node.marks = this.marks
    }
    this.push(node)
    return node
  }

  // : (NodeType, ?Object)
  // Wrap subsequent content in a node of the given type.
  openNode (type: MessageNodeType, attrs: { [key: string]: string }): void {
    this.stack.push({
      type: type,
      attrs,
      content: []
    })
  }

  // : () → ?Node
  // Close and return the node that is currently on top of the stack.
  closeNode (): MessageNode {
    if (this.marks.length > 0) this.marks = []
    const info = this.stack.pop()
    if (info !== undefined) {
      return this.addNode(info.type, info.attrs, info.content)
    }
    return { type: MessageNodeType.doc }
  }
}

function attrs (spec: ParsingRule, token: any): { [key: string]: string } {
  if (spec.getAttrs !== undefined) {
    return spec.getAttrs(token)
  } else if ((spec as any).attrs instanceof Function) { // For backwards compatibility when `attrs` is a Function
    return (spec as any).attrs(token)
  } else {
    return (spec as any).attrs
  }
}

// Code content is represented as a single token with a `content`
// property in Markdown-it.
function noCloseToken (spec: ParsingRule, type: any): boolean {
  return (
    (spec?.noCloseToken ?? false) ||
    type === 'code_inline' ||
    type === 'code_block' ||
    type === 'fence'
  )
}

function withoutTrailingNewline (str: string): string {
  return str[str.length - 1] === '\n' ? str.slice(0, str.length - 1) : str
}

function tokenHandlers (tokens: { [key: string]: ParsingRule }): Record<string, (state: MarkdownParseState, tok: any) => void> {
  const handlers: Record<string, (state: MarkdownParseState, tok: any) => void> = {}
  for (const type in tokens) {
    const spec = tokens[type]
    const specBlock = spec.block
    const specNode = spec.node
    const specMark = spec.mark
    if (specBlock !== undefined) {
      if (noCloseToken(spec, type)) {
        handlers[type] = (state: MarkdownParseState, tok: any) => {
          state.openNode(specBlock, attrs(spec, tok))
          state.addText(withoutTrailingNewline(tok.content))
          state.closeNode()
        }
      } else {
        handlers[type + '_open'] = (state: MarkdownParseState, tok: any) =>
          state.openNode(specBlock, attrs(spec, tok))
        handlers[type + '_close'] = (state: MarkdownParseState) =>
          state.closeNode()
      }
    } else if (specNode !== undefined) {
      handlers[type] = (state: MarkdownParseState, tok: any) =>
        state.addNode(specNode, attrs(spec, tok))
    } else if (specMark !== undefined) {
      if (noCloseToken(spec, type)) {
        handlers[type] = (state: MarkdownParseState, tok: any) => {
          state.openMark({
            attrs: attrs(spec, tok),
            type: specMark
          })
          state.addText(withoutTrailingNewline(tok.content))
          state.closeMark(specMark)
        }
      } else {
        handlers[type + '_open'] = (state: MarkdownParseState, tok: any) =>
          state.openMark({
            type: specMark,
            attrs: attrs(spec, tok)
          })
        handlers[type + '_close'] = (state: MarkdownParseState) => {
          state.closeMark(specMark)
        }
      }
    } else {
      throw new RangeError('Unrecognized parsing spec ' + JSON.stringify(spec))
    }
  }

  handlers.text = (state: any, tok: any) => state.addText(tok.content)
  handlers.inline = (state: any, tok: any) => state.parseTokens(tok.children)
  handlers.softbreak = handlers.softbreak ?? ((state: any) => state.addText('\n'))

  return handlers
}

// ::- A configuration of a Markdown parser. Such a parser uses
const tokens: { [key: string]: ParsingRule } = {
  blockquote: { block: MessageNodeType.blockquote },
  paragraph: { block: MessageNodeType.paragraph },
  list_item: { block: MessageNodeType.list_item },
  bullet_list: { block: MessageNodeType.bullet_list },
  ordered_list: {
    block: MessageNodeType.ordered_list,
    getAttrs: (tok: any) => ({ order: +tok.attrGet('start') ?? 1 })
  },
  heading: {
    block: MessageNodeType.heading,
    getAttrs: (tok: any) => ({ level: +tok.tag.slice(1) })
  },
  code_block: {
    block: MessageNodeType.code_block,
    noCloseToken: true
  },
  fence: {
    block: MessageNodeType.code_block,
    getAttrs: (tok: any) => ({ params: tok.info ?? '' }),
    noCloseToken: true
  },
  hr: { node: MessageNodeType.horizontal_rule },
  image: {
    node: MessageNodeType.image,
    getAttrs: (tok: any) => ({
      src: tok.attrGet('src'),
      title: tok.attrGet('title') ?? null,
      alt: (tok.children[0]?.content) ?? null
    })
  },
  hardbreak: { node: MessageNodeType.hard_break },

  em: { mark: MessageMarkType.em },
  strong: { mark: MessageMarkType.strong },
  link: {
    mark: MessageMarkType.link,
    getAttrs: (tok: any) => ({
      href: tok.attrGet('href'),
      title: tok.attrGet('title') ?? null
    })
  },
  code_inline: {
    mark: MessageMarkType.code,
    noCloseToken: true
  }
}

export class MarkdownParser {
  tokenizer: any
  tokenHandlers: any

  constructor () {
    this.tokenizer = MarkdownIt('commonmark', { html: false })
    this.tokenHandlers = tokenHandlers(tokens)
  }

  parse (text: string): MessageNode {
    const state = new MarkdownParseState(this.tokenHandlers)
    let doc: MessageNode

    state.parseTokens(this.tokenizer.parse(text, {}))
    do {
      doc = state.closeNode()
    } while (state.stack.length > 0)
    return doc
  }
}
