export enum MessageNodeType {
  doc = 'doc',
  paragraph = 'paragraph',
  blockquote = 'blockquote',
  horizontal_rule = 'horizontal_rule',
  heading = 'heading',
  code_block = 'code_block',
  text = 'text',
  image = 'image',
  hard_break = 'hard_break',
  ordered_list = 'ordered_list',
  bullet_list = 'bullet_list',
  list_item = 'list_item'
}
export enum MessageMarkType {
  link = 'link',
  em = 'em',
  strike = 'strike',
  underline = 'underline',
  strong = 'strong',
  code = 'code',
  reference = 'reference'
}

export interface MessageNode {
  type: string
  content: MessageNode[] | undefined // A list of child nodes
  marks: MessageMark[] | undefined
  text: string | undefined
}

export interface MessageMark {
  type: string
  attrs: { [key: string]: any } // A map of attributes
}

export function traverseMessage(
  node: MessageNode,
  f: (el: MessageNode) => void
) {
  f(node)
  if (node.content !== undefined) {
    for (let c of node.content!) {
      traverseMessage(c, f)
    }
  }
}
export function traverseMarks(node: MessageNode, f: (el: MessageMark) => void) {
  if (node.marks !== undefined) {
    for (let c of node.marks!) {
      f(c)
    }
  }
}
export function messageContent(node: MessageNode): MessageNode[] {
  let result: MessageNode[] = []
  if (node.content !== undefined) {
    result.push(...node.content!)
  }
  return result
}

export function newMessageDocument(): MessageNode {
  return {
    type: MessageNodeType.doc,
    content: [{ type: MessageNodeType.paragraph }]
  } as MessageNode
}

export interface LinkMark extends MessageMark {
  href: string
  title: string
}
export interface ReferenceMark extends MessageMark {
  attrs: { id: string; class: string }
}
export function parseMessage(message: string): MessageNode {
  return JSON.parse(message) as MessageNode
}
export function serializeMessage(node: MessageNode): string {
  return JSON.stringify(node)
}
