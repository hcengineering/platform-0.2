export type PanMoveEvent = CustomEvent<{
    x: number
    y: number
    dx: number
    dy: number
}>

export type PanStartEvent = CustomEvent<{
  x: number
  y: number
}>

export type PanEndEvent = PanStartEvent

export function pannable (node: HTMLElement): { destroy: () => void } {
  let x: number
  let y: number

  function handleMousedown (event: MouseEvent) {
    x = event.clientX
    y = event.clientY

    const panStartEvt = new CustomEvent('panstart', {
      detail: { x, y }
    })

    node.dispatchEvent(panStartEvt)

    window.addEventListener('mousemove', handleMousemove)
    window.addEventListener('mouseup', handleMouseup)
  }

  function handleMousemove (event: MouseEvent) {
    const dx = event.clientX - x
    const dy = event.clientY - y
    x = event.clientX
    y = event.clientY

    const panMoveEvt: PanMoveEvent = new CustomEvent('panmove', {
      detail: { x, y, dx, dy }
    })

    node.dispatchEvent(panMoveEvt)
  }

  function handleMouseup (event: MouseEvent) {
    x = event.clientX
    y = event.clientY

    const panEndEvt: PanEndEvent = new CustomEvent('panend', {
      detail: { x, y }
    })
    node.dispatchEvent(panEndEvt)

    window.removeEventListener('mousemove', handleMousemove)
    window.removeEventListener('mouseup', handleMouseup)
  }

  node.addEventListener('mousedown', handleMousedown)

  return {
    destroy () {
      node.removeEventListener('mousedown', handleMousedown)
    }
  }
}
