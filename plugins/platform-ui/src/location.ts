import { Location as PlatformLocation } from './index'

export function locationToUrl (location: PlatformLocation): string {
  let result = '/'
  if (location.path) {
    result += location.path.map(p => encodeURIComponent(p)).join('/')
  }
  if (location.query) {
    const queryValue = Object.entries(location.query).map(e => {
      if (e[1]) {
        // Had value
        return encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1])
      } else {
        return encodeURIComponent(e[0])
      }
    }).join('&')
    if (queryValue.length > 0) {
      result += '?' + queryValue
    }
  }
  if (location.fragment && location.fragment.length > 0) {
    result += '#' + encodeURIComponent(location.fragment)
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
  for (var i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    const key = decodeURIComponent(pair[0])
    if (key.length > 0) {
      if (pair.length > 1) {
        const value = decodeURIComponent(pair[1])
        result[key] = value
      } else {
        result[key] = null
      }
    }
  }
  return result
}

export function parsePath (path: string): string[] {
  const split = path.split('/').map(ps => decodeURIComponent(ps))
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

export function parseHash (hash: any): string {
  if (hash.startsWith('#')) {
    return hash.substring(1)
  }
  return hash
}
