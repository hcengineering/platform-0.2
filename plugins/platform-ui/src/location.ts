import { Location as PlatformLocation } from './index'

export function locationToUrl (location: PlatformLocation): string {
  let result = '/'
  if (location.path !== undefined) {
    result += location.path.map((p) => encodeURIComponent(p)).join('/')
  }
  if (location.query !== undefined) {
    const queryValue = Object.entries(location.query)
      .map((e) => {
        if (e[1] !== undefined) {
          // Had value
          return String(e[0]) + '=' + String(e[1])
        } else {
          return e[0]
        }
      })
      .join('&')
    if (queryValue.length > 0) {
      result += '?' + queryValue
    }
  }
  if (location.fragment !== undefined && location.fragment.length > 0) {
    result += '#' + location.fragment
  }

  return result
}

export function parseLocation (location: Location): PlatformLocation {
  return {
    path: parsePath(location.pathname),
    query: parseQuery(location.search),
    fragment: parseHash(location.hash)
  }
}

export function parseQuery (query: string): Record<string, string | null> {
  query = query.trim()
  if (query.length === 0 || !query.startsWith('?')) {
    return {}
  }
  query = query.substring(1)
  const vars = query.split('&')
  const result: Record<string, string | null> = {}
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    const key = pair[0]
    if (key.length > 0) {
      if (pair.length > 1) {
        const value = pair[1]
        result[key] = value
      } else {
        result[key] = null
      }
    }
  }
  return result
}

export function parsePath (path: string): string[] {
  const split = path.split('/').map((ps) => decodeURIComponent(ps))
  if (split.length >= 1) {
    if (split[0] === '') {
      split.splice(0, 1)
    }
  }
  if (split.length >= 1) {
    if (split[split.length - 1] === '') {
      split.splice(split.length - 1, 1)
    }
  }
  return split
}

export function parseHash (hash: string): string {
  if (hash.startsWith('#')) {
    return hash.substring(1)
  }
  return hash
}
