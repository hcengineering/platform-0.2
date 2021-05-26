import { Readable, Writable, writable, readable, derived } from 'svelte/store'
import debounce from 'lodash/debounce'

interface Size {
  width: number
  height: number
}

interface GridProps {
  size: Readable<Size>
  amount: Writable<number>
  containerSize: Readable<Size>
}

export function initGridStore (): GridProps {
  return {
    amount: writable(0),
    size: readable({ width: 0, height: 0 }, () => {}),
    containerSize: readable({ width: 0, height: 0 }, () => {})
  }
}

export function makeGridSizeStore (container: Element, initAmount: number): GridProps {
  const containerSize = readable<Size>({ width: 0, height: 0 }, set => {
    const debouncedSet = debounce(set, 150)
    const observer = new ResizeObserver(
      ([{ contentRect: { width, height } }]) => debouncedSet({ width, height })
    )

    observer.observe(container)

    return () => observer.unobserve(container)
  })

  const amountStore = writable(initAmount)

  return {
    size: derived([amountStore, containerSize], ([amount, size]) => {
      return Array(amount).fill(0).map((_, i) => i + 1)
        .map(rowSize => {
          const columnsAmount = Math.ceil(amount / rowSize)
          const possibleWidth = size.width / rowSize
          const possibleHeight = possibleWidth * 3 / 4

          const height = possibleHeight * columnsAmount > size.height
            ? size.height / columnsAmount
            : possibleHeight
          const width = height * 4 / 3

          return { height, width }
        })
        .reduce((r, x) => r.width * r.height > x.width * x.height ? r : x)
    }),
    amount: amountStore,
    containerSize
  }
}
