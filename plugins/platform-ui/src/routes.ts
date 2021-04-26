import { AnyComponent } from './index'
import { parseHash, parsePath, parseQuery } from './location'
import { Metadata } from '@anticrm/platform'

import { deepEqual } from 'fast-equals'

/**
 * Describe a browser URI location parsed to path, query and fragment.
 */
export interface Location {
  path: string[] // A useful path value
  query: Record<string, string | null> // a value of query parameters, no duplication are supported
  fragment: string // a value of fragment
}

/**
 * Define a useful route to applications.
 */
export interface ApplicationRoute {
  route: string
  component: AnyComponent
}

export function routeMeta (name: string): Metadata<ApplicationRoute> {
  return ('routes:' + name) as Metadata<ApplicationRoute>
}

/**
 * Could be registered to provide platform a way to decide about routes from Root component.
 */
export interface ApplicationRouter<T> {
  /**
   * Return parent router if defined.
   */
  parent: () => ApplicationRouter<any> | undefined

  /**
   * Construct a child router based on current matched state
   * Internal child router is just one, and calling twice will replace existing.
   */
  newRouter: <P>(pattern: string) => ApplicationRouter<P>

  /**
   * Will check and match path for registered local routes, if no local routes are match will return false
   */
  match: () => boolean

  /**
   * Return current matched set.
   */
  properties: () => T

  /**
   * Replace defaults passed with constructor, will call matcher function passed with constructor.
   * @param defaults - a new defaults
   */
  setDefaults: (defaults: T) => void

  /**
   * Replace a matcher function passed with constructor.
   * @param matcher
   */
  subscribe: (matcher: (match: T) => void) => void

  // Construct a new navigate using combined query parameters
  queries: (vars: Partial<T>) => Record<string, any> | undefined
  // Construct a current path with all applied variables
  path: (vars: Partial<T>) => string[]
  // Construct a current fragment with app applied variables
  fragment: (vars: Partial<T>) => string | undefined

  /**
   * Construct a full new location based on values of T.
   * Other values will be taken from stored parent and child routers.
   * @param values
   */
  location: (values: Partial<T>) => Location

  /**
   * Use new constructed location value and platform UI to navigate.
   * @param values
   */
  navigate: (values: Partial<T>) => void
}

export class Router<T> implements ApplicationRouter<T> {
  private readonly pattern: string
  private segments: string[] = []
  private queryNames: string[] = []
  private fragmentName: string = ''

  private readonly parentRouter: Router<any> | undefined
  private childRouter: Router<any> | undefined

  private rawLocation: Location | undefined // current location
  private childLocation: Location | undefined

  // Currently matched variables
  private variables: Record<string, any> = {}
  private defaults: Record<string, any> | undefined = undefined
  private matcher?: (match: T) => void

  private matched = false

  private readonly doNavigate: ((newLoc: Location) => void) | undefined

  constructor (
    pattern: string,
    parent: Router<any> | undefined = undefined,
    defaults: T | undefined = undefined,
    doNavigate: ((newLoc: Location) => void) | undefined = undefined
  ) {
    this.pattern = pattern
    this.parentRouter = parent
    if (defaults !== undefined) {
      this.defaults = defaults
    }
    this.parsePattern()
    this.doNavigate = doNavigate
  }

  navigate (values: Partial<T>): void {
    if (this.doNavigate !== undefined) {
      this.doNavigate(this.location(values))
    }
  }

  public subscribe (matcher: (match: T) => void): void {
    this.matcher = matcher
    if (this.matched && this.matcher !== undefined) {
      this.matcher(this.variables as T)
    }
  }

  /**
   * Will received new location
   * @param loc - a new location
   * @param forceUpdate - if true will force updating
   */
  update (loc: Location, forceUpdate = false): void {
    this.rawLocation = loc
    const oldVars = this.variables
    this.matched = this.doMatch()
    this.chainUpdate()
    if (this.matcher !== undefined && (!deepEqual(oldVars, this.variables) || forceUpdate)) {
      this.matcher(this.variables as T)
    }
  }

  match (): boolean {
    return this.matched
  }

  doMatch (): boolean {
    // Use defaults as initial values.
    this.variables = this.defaults !== undefined ? { ...this.defaults } : {}

    // Perform matching of current location with extraction of variables and constructing childLocation.
    if (this.rawLocation !== undefined) {
      this.childLocation = { path: [], query: {}, fragment: '' }
      const path = [...this.rawLocation.path]
      for (const s of this.segments) {
        if (path.length > 0) {
          const value = path.splice(0, 1)[0]
          if (s.startsWith(':')) {
            // This is variable, so store value based on it's name
            this.variables[s.substring(1)] = value
          } else {
            if (s !== value) {
              throw new Error(`Path segment :${s} is not matching ${value} in ${this.pattern}`)
            }
          }
        } else {
          // Ensure all variables used in path had defaults.
          for (const s of this.segments) {
            if (s.startsWith(':')) {
              const varName = s.substring(1)
              if (this.variables[varName] === undefined) {
                // No variable for path segment
                throw new Error(
                  `Could not match variable:${varName} in ${this.pattern} should be specified in defaults or URI`
                )
              }
            }
          }
          // Ensure all variables had defined, so we could assume defaults.
          // Not enough path segments found.
          break
        }
      }
      this.childLocation.path = path

      // Update fragment
      if (this.fragmentName !== undefined) {
        this.variables[this.fragmentName] = this.rawLocation.fragment
      } else {
        this.childLocation.fragment = this.rawLocation.fragment
      }
      this.childLocation.query = { }

      // Update Query
      for (const q of this.queryNames) {
        const v = this.rawLocation.query[q]
        if (v !== undefined) {
          this.variables[q] = v
        }
      }
      for (const q of Object.entries(this.rawLocation.query)) {
        if (!this.queryNames.includes(q[0])) {
          this.childLocation.query[q[0]] = q[1]
        }
      }
      if (this.childRouter !== undefined) {
        this.childRouter.update(this.childLocation)
      }
      return true
    }
    return false
  }

  newRouter<P>(pattern: string, defaults: P | undefined = undefined): Router<P> {
    this.childRouter = new Router<P>(pattern, this, defaults, this.doNavigate)
    this.chainUpdate()
    return this.childRouter as Router<P>
  }

  properties (): T {
    return this.variables as T
  }

  setDefaults (defaults: T): void {
    this.defaults = defaults
    if (this.rawLocation !== undefined) {
      this.update(this.rawLocation, true)
    }
  }

  parent (): ApplicationRouter<any> | undefined {
    return this.parentRouter
  }

  path (vars: Partial<T> = {}): string[] {
    return this.calcPath(vars, this.parents(), this.children())
  }

  private calcPath (vars: Partial<T>, parents: Array<Router<any>>, children: Array<Router<any>>): string[] {
    let variables = this.variables as T
    variables = { ...variables, ...vars }
    const path: string[][] = []
    const toPath = (p: Router<any>): string[] => p.currentPath()

    path.push(...parents.map(toPath))
    path.push(this.currentPath(variables))
    path.push(...children.map(toPath))
    return path.reduce((acc, cur) => acc.concat(cur))
  }

  currentPath (vars: T | undefined = undefined): string[] {
    if (vars === undefined) {
      vars = this.variables as T
    }
    const ll = (vars as unknown) as Record<string, any>
    const result: string[] = []
    for (const s of this.segments) {
      if (s.startsWith(':')) {
        // This is variable, so store value based on it's name
        result.push(ll[s.substring(1)])
      } else {
        result.push(s)
      }
    }
    return result
  }

  queries (vars: Partial<T>): Record<string, string | undefined> | undefined {
    return this.calcQueries(vars, this.parents(), this.children())
  }

  private calcQueries (vars: Partial<T>, parents: Array<Router<any>>, children: Array<Router<any>>): Record<string, string> {
    let variables = this.variables as T
    variables = { ...variables, ...vars }
    const result: Record<string, string> = {}
    parents.map((p) => p.currentQueries(result))
    this.currentQueries(result, variables)
    children.map((p) => p.currentQueries(result))
    return result
  }

  /**
   * Join values, leaf values are more important.
   * @param result
   * @private
   */
  currentQueries (result: Record<string, string>, vars: T | undefined = undefined): Record<string, string> | undefined {
    if (vars === undefined) {
      vars = this.variables as T
    }
    const ll = (vars as unknown) as Record<string, any>
    for (const qName of this.queryNames) {
      const val = ll[qName]
      if (val !== undefined) {
        result[qName] = val
      }
    }
    return result
  }

  fragment (vars: Partial<T>): string | undefined {
    return this.calcFragment(vars, this.parents(), this.children())
  }

  /**
   * Will return last one defined fragment.
   */
  private calcFragment (vars: Partial<T>, parents: Array<Router<any>>, children: Array<Router<any>>): string {
    let variables = this.variables as T
    variables = { ...variables, ...vars }
    // Check all children in reverse order
    for (const r of [...children].reverse()) {
      const ff = r.currentFragment()
      if (ff !== undefined) {
        return ff
      }
    }

    const curFragment = this.currentFragment(variables)
    if (curFragment !== undefined) {
      return curFragment
    }

    // Check all parents
    for (const r of [...parents].reverse()) {
      const ff = r.currentFragment()
      if (ff !== undefined) {
        return ff
      }
    }
    return ''
  }

  /**
   * Return leaf fragment first and upwards
   * @private
   */
  currentFragment (vars: T | undefined = undefined): string | undefined {
    if (vars === undefined) {
      vars = this.variables as T
    }
    const ll = (vars as unknown) as Record<string, any>
    if (this.fragmentName !== '') {
      const val = ll[this.fragmentName]
      if (val !== undefined) {
        return val
      }
    }
    return undefined
  }

  location (values: Partial<T>): Location {
    const parents = this.parents()
    const children = this.children()
    return {
      path: this.calcPath(values, parents, children),
      query: this.calcQueries(values, parents, children),
      fragment: this.calcFragment(values, parents, children)
    }
  }

  private parsePattern (): void {
    // Parse pattern for faster matching
    this.segments = parsePath(this.pattern)
    // Extract query from last path segment.
    if (this.segments.length > 0) {
      let lastPath = this.segments[this.segments.length - 1]
      // Extract #fragment
      const fpos = lastPath.indexOf('#')
      if (fpos !== -1) {
        this.fragmentName = parseHash(lastPath.substring(fpos))
        lastPath = lastPath.substring(0, fpos)
      }
      // Extract ?queryA=a,queryB=b,queryC
      const qpos = lastPath.indexOf('?')
      if (qpos !== -1) {
        this.queryNames = Object.keys(parseQuery(lastPath.substring(qpos)))
        lastPath = lastPath.substring(0, qpos)
      }
      // Replace last segment or remove it.
      if (lastPath.length > 0) {
        this.segments[this.segments.length - 1] = lastPath
      } else {
        // No need last item, just remove it
        this.segments.splice(this.segments.length - 1, 1)
      }
    }
  }

  private chainUpdate (): void {
    if (this.matched && this.childRouter !== undefined && this.childLocation !== undefined) {
      this.childRouter.update(this.childLocation)
    }
  }

  private parents (): Array<Router<any>> {
    const result: Array<Router<any>> = []
    let item = this.parentRouter
    while (item !== undefined) {
      result.push(item)
      if (item.parentRouter !== undefined) {
        item = item.parentRouter
      } else {
        break
      }
    }
    return result.reverse()
  }

  private children (): Array<Router<any>> {
    const result: Array<Router<any>> = []
    let item = this.childRouter
    while (item !== undefined) {
      result.push(item)
      if (item.childRouter !== undefined) {
        item = item.childRouter
      } else {
        break
      }
    }
    return result
  }

  clearChildRouter (): void {
    this.childRouter = undefined
  }
}
