///

import { Doc, Emb, Ref } from './classes'

function toHex (value: number, chars: number): string {
  const result = value.toString(16)
  if (result.length < chars) {
    return '0'.repeat(chars - result.length) + result
  }
  return result
}

let counter = Math.random() * (1 << 24) | 0
const random = toHex(Math.random() * (1 << 24) | 0, 6) + toHex(Math.random() * (1 << 16) | 0, 4)

function timestamp (): string {
  const time = (Date.now() / 1000) | 0
  return toHex(time, 8)
}

function count (): string {
  const val = counter++ & 0xffffff
  return toHex(val, 6)
}

export function generateId<T extends Doc | Emb> (): Ref<T> {
  return timestamp() + random + count() as Ref<T>
}

export function noId<T extends Doc | Emb> (): Ref<T> {
  return '' as Ref<T>
}
