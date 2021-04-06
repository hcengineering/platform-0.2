//
// Copyright © 2021 Anticrm Platform Contributors.
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

import { Readable } from 'svelte/store'

export interface Pos {
  x: number
  y: number
}

/**
 * Define an event about card is being dragged.
 */
export interface CardDragEvent<T> {
  doc: T
  dragged: boolean
  event?: CustomEvent<Pos>
  coords?: Readable<Pos>
}

export type PanMoveEvent = CustomEvent<Pos & {
  dx: number
  dy: number
}>

export type PanStartEvent = CustomEvent<Pos>

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
