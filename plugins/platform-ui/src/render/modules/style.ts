import { isString, hyphenate, capitalize } from '@vue/shared'

const cacheStringFunction = <T extends (str: string) => string> (fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}

const camelizeRE = /-(\w)/g
export const camelize = cacheStringFunction(
  (str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
  }
)

type Style = string | Partial<CSSStyleDeclaration> | null

export function patchStyle (el: Element, prev: Style, next: Style) {
  const style = (el as HTMLElement).style
  if (!next) {
    el.removeAttribute('style')
  } else if (isString(next)) {
    style.cssText = next
  } else {
    for (const key in next) {
      setStyle(style, key, next[key] as string)
    }
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (!next[key]) {
          setStyle(style, key, '')
        }
      }
    }
  }
}

const importantRE = /\s*!important$/

function setStyle (style: CSSStyleDeclaration, name: string, val: string) {
  if (name.startsWith('--')) {
    // custom property definition
    style.setProperty(name, val)
  } else {
    const prefixed = autoPrefix(style, name)
    if (importantRE.test(val)) {
      // !important
      style.setProperty(
        hyphenate(prefixed),
        val.replace(importantRE, ''),
        'important'
      )
    } else {
      style[prefixed as any] = val
    }
  }
}

const prefixes = ['Webkit', 'Moz', 'ms']
const prefixCache: Record<string, string> = {}

function autoPrefix (style: CSSStyleDeclaration, rawName: string): string {
  const cached = prefixCache[rawName]
  if (cached) {
    return cached
  }
  let name = camelize(rawName)
  if (name !== 'filter' && name in style) {
    return (prefixCache[rawName] = name)
  }
  name = capitalize(name)
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name
    if (prefixed in style) {
      return (prefixCache[rawName] = prefixed)
    }
  }
  return rawName
}
