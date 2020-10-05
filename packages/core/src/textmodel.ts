export class MessageNode {
  type: string = ''
  content: MessageNode[] | undefined = undefined // A list of child nodes
  marks: MessageMark[] | undefined = undefined
  text: string | undefined = undefined

  traverse(f: (el: MessageNode) => void) {
    f(this)
    if (this.content !== undefined) {
      for (let c of this.content!) {
        c.traverse(f)
      }
    }
  }
  traverseMarks(f: (el: MessageMark) => void) {
    if (this.marks !== undefined) {
      for (let c of this.marks!) {
        f(c)
      }
    }
  }
  childs(): MessageNode[] {
    let result: MessageNode[] = []
    if (this.content !== undefined) {
      result.push(...this.content!)
    }
    return result
  }
}
export class MessageDocument extends MessageNode {}
export class MessageParagraph extends MessageNode {}
export class MessageBlockQuote extends MessageNode {}
export class MessageHeading extends MessageNode {
  level: number = 1
}
export class MessageHorizontalRule extends MessageNode {}
export class MessageCodeBlock extends MessageNode {}
export class MessageText extends MessageNode {}
export class MessageImage extends MessageNode {
  src: string = ''
  title: string = ''
  alt: string = ''
}
export class MessageHardBreak extends MessageNode {}
export class MessageOrderedList extends MessageNode {}
export class MessageBulletList extends MessageNode {}
export class MessageListItem extends MessageNode {}

export class MessageMark {
  type: string = ''
  attrs: { [key: string]: any } = {} // A map of attributes
}
export class LinkMark extends MessageMark {
  href: string = ''
  title: string = ''
}
export class ItalicMark extends MessageMark {}
export class StrongMark extends MessageMark {}
export class StrikeMark extends MessageMark {}
export class UnderlineMark extends MessageMark {}
export class CodeMark extends MessageMark {}
export class ReferenceMark extends MessageMark {
  attrs: { id: string; class: string } = { id: '', class: '' }
}

export function parseMessage(json: any): MessageNode {
  return toNode(json)
}

// Convert a prosemirror schema to type element.
export function parseMessageText(json: string): MessageNode {
  return toNode(JSON.parse(json))
}

function toMark(mark: any): MessageMark {
  let op = toMarkConv[mark.type]
  if (op !== undefined) {
    return op(mark)
  }
  return Object.assign(new MessageMark(), mark)
}

function toNode(node: any): MessageNode {
  let op = toNodeConv[node.type]
  if (op !== undefined) {
    let copy = Object.assign({}, node)
    if (node.marks !== undefined && node.marks.length > 0) {
      let marks: MessageMark[] = []
      for (let m of node.marks) {
        marks.push(toMark(m))
      }
      copy.marks = marks
    }
    if (node.content !== undefined && node.content.length > 0) {
      let content: MessageNode[] = []
      for (let n of node.content) {
        content.push(toNode(n))
      }
      copy.content = content
    }
    // Replace marks if pressent
    return op(copy)
  }
  // Just generic conversion.
  return Object.assign(new MessageNode(), node)
}

const toNodeConv: { [id: string]: (e: any) => MessageNode } = {
  paragraph: (e: any) => Object.assign(new MessageParagraph(), e),
  blockquote: (e: any) => Object.assign(new MessageBlockQuote(), e),
  horizontal_rule: (e: any) => Object.assign(new MessageHorizontalRule(), e),
  heading: (e: any) => Object.assign(new MessageHeading(), e),
  code_block: (e: any) => Object.assign(new MessageCodeBlock(), e),
  text: (e: any) => Object.assign(new MessageText(), e),
  image: (e: any) => Object.assign(new MessageImage(), e),
  hard_break: (e: any) => Object.assign(new MessageHardBreak(), e),
  ordered_list: (e: any) => Object.assign(new MessageOrderedList(), e),
  bullet_list: (e: any) => Object.assign(new MessageBulletList(), e),
  list_item: (e: any) => Object.assign(new MessageListItem(), e),
  doc: (e: any) => Object.assign(new MessageDocument(), e)
}
const toMarkConv: { [id: string]: (e: any) => MessageMark } = {
  // Marks
  link: (e: any) => Object.assign(new LinkMark(), e),
  em: (e: any) => Object.assign(new ItalicMark(), e),
  strike: (e: any) => Object.assign(new StrikeMark(), e),
  underline: (e: any) => Object.assign(new UnderlineMark(), e),
  strong: (e: any) => Object.assign(new StrongMark(), e),
  code: (e: any) => Object.assign(new CodeMark(), e),
  reference: (e: any) => Object.assign(new ReferenceMark(), e)
}
