
export interface CompletionItem {
  key: string
  label: string
  title?: string
}

export interface Position {
  left: number
  right: number
  top: number
  bottom: number
}

export function getFirst (items: CompletionItem[]): CompletionItem {
  return (items.length > 0 ? items[0] : { key: '' }) as CompletionItem
}

export function calcOffset (element: HTMLElement): number {
  if (element != null) {
    const pp = element.parentElement
    return pp != null ? pp.offsetTop : -1
  }
  return -1
}
