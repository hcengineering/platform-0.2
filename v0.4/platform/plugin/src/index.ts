//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

/**
 * Plugin architecture and implementation
 * @packageDocumentation
 */

import { Status, Severity } from '@anticrm/status'

/**
 * Platform Resource Identifier (PRI)
 *
 * @remarks
 *
 * Almost anything in the Anticrm Platform is a `Resource`. Resources referenced by Platform Resource Identifier (PRI).
 *
 * TODO: understand Resource better. Is this just a `platform` thing or should be in `core` as well
 *
 * 'Resource' is simply any JavaScript object. There is a plugin exists, which 'resolve' PRI into actual object.
 * This is a difference from Metadata. Metadata object 'resolved' by Platform instance, so we may consider Metadata as
 * a Resource, provided by Platform itself. Because there is always a plugin, which resolve `Resource` resolution is
 * asynchronous process.
 *
 * `Resource` is a string of `kind:plugin.id` format. Since Metadata is a kind of Resource.
 * Metadata also can be resolved using resource API.
 *
 * @example
 * ```typescript
 *   `class:contact.Person` as Resource<Class<Person>> // database object with id === `class:contact.Person`
 *   `string:class.ClassLabel` as Resource<string> // translated string according to current language and i18n settings
 *   `asset:ui.Icons` as Resource<URL> // URL to SVG sprites
 *   `easyscript:2+2` as Resource<() => number> // function
 * ```
 *
 * @public
 */
export type Resource<T> = string & { __resource: T }

/**
 * Platform Metadata Identifier (PMI).
 *
 * 'Metadata' is simply any JavaScript object, which is used to configure platform, e.g. IP addresses.
 * Another example of metadata is an asset URL. The logic behind providing asset URLs as metadata is
 * we know URL at compile time only and URLs vary depending on deployment options.
 */
export type Metadata<T> = Resource<T> & { __metadata: true }

// P L U G I N S

/** Base interface for a plugin service. */
export interface Service {} // eslint-disable-line @typescript-eslint/no-empty-interface

/** Plugin identifier. */
export type Plugin<S extends Service> = Resource<S>
export type AnyPlugin = Plugin<Service>

/** A list of dependencies e.g. `{ core: core.id, ui: ui.id }`. */
export interface PluginDependencies {
  [key: string]: AnyPlugin
}

/**
 * Convert list of dependencies to a list of provided services,
 * e.g. `PluginServices<{core: core.id}> === {core: CoreService}`
 */
export type PluginServices<T extends PluginDependencies> = {
  [P in keyof T]: T[P] extends Plugin<infer Service> ? Service : T[P]
}

/**
 * A Plugin Descriptor, literally plugin ID + dependencies.
 */
export interface PluginDescriptor<S extends Service, D extends PluginDependencies> {
  id: Plugin<S>
  deps: D
}

type AnyDescriptor = PluginDescriptor<Service, PluginDependencies>

type PluginModule<P extends Service, D extends PluginDependencies> = () => Promise<{
  default: (platform: Platform, deps: PluginServices<D>) => Promise<P>
}>
type AnyModule = PluginModule<Service, PluginDependencies>

export enum PluginStatus {
  STOPPED,
  RUNNING
}

export interface PluginInfo {
  id: AnyPlugin
  version: string
  status: PluginStatus
}

export const PlatformStatus = 'platform-status'

// P L A T F O R M

type ExtractType<T, X extends Record<string, Metadata<T>>> = {
  [P in keyof X]: X[P] extends Metadata<infer Z> ? Z : never
}

type EventListener = (event: string, data: any) => Promise<void>

export interface Platform {
  getMetadata: <T>(id: Metadata<T>) => T | undefined
  setMetadata: <T>(id: Metadata<T>, value: T) => void
  loadMetadata: <T, X extends Record<string, Metadata<T>>>(ids: X, resources: ExtractType<T, X>) => void

  addLocation: <P extends Service, X extends PluginDependencies>(
    plugin: PluginDescriptor<P, X>,
    module: PluginModule<P, X>
  ) => void
  resolveDependencies: (id: Plugin<any>, deps: PluginDependencies) => Promise<{ [key: string]: Service }>
  getPlugin: <T extends Service>(id: Plugin<T>) => Promise<T>

  getResource: <T>(resource: Resource<T>) => Promise<T>
  setResource: <T>(resource: Resource<T>, value: T) => void
  peekResource: <T>(resource: Resource<T>) => T | undefined

  addEventListener: (event: string, listener: EventListener) => void
  removeEventListener: (event: string, listener: EventListener) => void
  broadcastEvent: (event: string, data: any) => void

  setPlatformStatus: (status: Status) => void
}

/*!
 * Anticrm Platform™
 * © 2020, 2021 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export function createPlatform (): Platform {
  const resources = new Map<Resource<any>, any>()

  // M E T A D A T A

  function getMetadata<T> (id: Metadata<T>): T | undefined {
    return resources.get(id)
  }

  function setMetadata<T> (id: Metadata<T>, value: T): void {
    resources.set(id, value)
  }

  function loadMetadata<T, X extends Record<string, Metadata<T>>> (ids: X, metadata: ExtractType<T, X>): void {
    for (const key in ids) {
      const id = ids[key]
      const resource = metadata[key]
      if (resource === undefined) {
        throw new Error(`no metadata provided, key: ${key}, id: ${String(id)}`)
      }
      resources.set(id, resource)
    }
  }

  // R E S O U R C E S

  const resolvingResources = new Map<Resource<any>, Promise<any>>()

  /** Peek does not resolve resource. Return resource if it's already loaded. */
  function peekResource<T> (resource: Resource<T>): T | undefined {
    return resources.get(resource)
  }

  async function getResource<T> (resource: Resource<T>): Promise<T> {
    const resolved = resources.get(resource)
    if (resolved !== undefined) {
      return resolved
    } else {
      let resolving = resolvingResources.get(resource)
      if (resolving != null) {
        return await resolving
      }

      resolving = new Promise((resolve, reject) => {
        const info = getResourceInfo(resource)
        getPlugin(info.plugin)
          .then(() => {
            const value = resources.get(resource)
            if (value === undefined) {
              throw new Error('resource not loaded: ' + resource)
            }
            resolve(value)
          })
          .catch((err) => {
            reject(err)
          })
          .finally(() => {
            // Clear resolving map
            resolvingResources.delete(resource)
          })
      })

      resolvingResources.set(resource, resolving)
      return resolving
    }
  }

  function setResource<T> (resource: Resource<T>, value: T): void {
    resources.set(resource, value)
  }

  // E V E N T S

  const eventListeners = new Map<string, EventListener[]>()

  function addEventListener (event: string, listener: EventListener): void {
    const listeners = eventListeners.get(event)
    if (listeners != null) {
      listeners.push(listener)
    } else {
      eventListeners.set(event, [listener])
    }
  }

  function removeEventListener (event: string, listener: EventListener): void {
    const listeners = eventListeners.get(event)
    if (listeners != null) {
      listeners.splice(listeners.indexOf(listener), 1)
    }
  }

  function broadcastEvent (event: string, data: any): void {
    const listeners = eventListeners.get(event)
    if (listeners != null) {
      listeners.forEach((listener) => void listener(event, data)) // eslint-disable-line no-void
    }
  }

  function setPlatformStatus (status: Status | Error | string | unknown): void {
    if (typeof status === 'string') {
      broadcastEvent(PlatformStatus, new Status(Severity.INFO, 0, status))
    } else if (status instanceof Error) {
      const err = status
      broadcastEvent(PlatformStatus, new Status(Severity.ERROR, 0, err.message))
    } else if (status instanceof Status) {
      broadcastEvent(PlatformStatus, status)
    } else {
      broadcastEvent(PlatformStatus, new Status(Severity.WARNING, 0, `Unknown status: ${String(status)}`))
    }
  }

  async function createMonitor<T> (name: string, promise: Promise<T>): Promise<T> {
    setPlatformStatus(name)
    try {
      const result = await promise
      setPlatformStatus(new Status(Severity.OK, 0, ''))
      return result
    } catch (err) {
      setPlatformStatus(err)
      throw err
    }
  }

  // P L U G I N S

  const plugins = new Map<AnyPlugin, Promise<Service>>()
  const locations = [] as Array<[AnyDescriptor, AnyModule]>
  const running = new Map<AnyPlugin, Service>()

  function getLocation (id: AnyPlugin): [AnyDescriptor, AnyModule] {
    for (const location of locations) {
      if (location[0].id === id) {
        return location
      }
    }
    throw new Error('no location provided for plugin: ' + id)
  }

  function addLocation<P extends Service, X extends PluginDependencies> (
    plugin: PluginDescriptor<P, X>,
    module: PluginModule<P, X>
  ): void {
    locations.push([plugin, module as any])
  }

  async function getPlugin<T extends Service> (id: Plugin<T>): Promise<T> {
    const plugin = plugins.get(id)
    if (plugin !== undefined) {
      return (await plugin) as T
    } else {
      const plugin = resolvePlugin(id)
      try {
        plugins.set(id, plugin)
        ;(await plugin) as Promise<T>
      } catch (ex) {
        // remove plugin, and try on next attempt.
        plugins.delete(id)
      }
      return (await plugin) as T
    }
  }

  async function resolvePlugin<T extends Service> (id: Plugin<T>): Promise<Service> {
    const location = getLocation(id)
    const deps = await resolveDependencies(id, location[0].deps)

    let loaderPromise
    
    if (id !== 'ui') {
      loaderPromise = new Promise<{ default: (platform: Platform, deps: PluginServices<PluginDependencies>) => Promise<Service> }>((resolve, reject) => {
        setInterval(() => {
          location[1]().then(result => resolve(result)).catch(err => reject(err))
        }, 3000)
      })  
    } else {
      loaderPromise = location[1]()
    }

    const loadedPlugin = await createMonitor(`Loading module '<b>${id}</b>'...`, loaderPromise)
    const f = loadedPlugin.default
    const service = await f(platform, deps)
    running.set(id, service)
    return service
  }

  async function resolveDependencies (
    parentId: Plugin<any>,
    deps: PluginDependencies
  ): Promise<{ [key: string]: Service }> {
    const result: { [key: string]: Service } = {}
    for (const key in deps) {
      const id = deps[key]
      result[key] = await getPlugin(id)
    }
    return result
  }

  const platform: Platform = {
    getMetadata,
    setMetadata,
    loadMetadata,

    addLocation,
    resolveDependencies,
    getPlugin,

    getResource,
    setResource,
    peekResource,

    addEventListener,
    removeEventListener,
    broadcastEvent,

    setPlatformStatus
  }

  return platform
}

// I D E N T I T Y

type Namespace = Record<string, Record<string, any>>

function transform<N extends Namespace> (plugin: AnyPlugin, namespaces: N, f: (id: string, value: any) => any): N {
  const result: Namespace = {}
  for (const namespace in namespaces) {
    const extensions = namespaces[namespace]
    const transformed: Record<string, any> = {}
    for (const key in extensions) {
      transformed[key] = f(namespace + ':' + plugin + '.' + key, extensions[key])
    }
    result[namespace] = transformed
  }
  return result as N
}

export function identify<N extends Namespace> (pluginId: AnyPlugin, namespace: N): N {
  return transform(pluginId, namespace, (id: string, value) => (value === '' ? id : value))
}

export function plugin<P extends Service, D extends PluginDependencies, N extends Namespace> (
  id: Plugin<P>,
  deps: D,
  namespace: N
): PluginDescriptor<P, D> & N {
  return {
    id,
    deps,
    ...identify(id, namespace)
  }
}

// R E S O U R C E  I N F O

export type ResourceKind = string & { __resourceKind: true }

export interface ResourceInfo {
  kind: ResourceKind
  plugin: Plugin<Service>
  id: string
}

export function getResourceInfo (resource: Resource<any>): ResourceInfo {
  const index = resource.indexOf(':')
  if (index === -1) {
    throw new Error('invalid resource id format')
  }
  const kind = resource.substring(0, index) as ResourceKind
  const dot = resource.indexOf('.', index)
  const plugin = resource.substring(index + 1, dot) as AnyPlugin
  const id = resource.substring(dot)
  return {
    kind,
    plugin,
    id
  }
}

// A U T H O R I Z A T I O N

export const WHO_AM_I: Metadata<string> = 'platform.WhoAmI' as Metadata<string>
export const TOKEN: Metadata<string> = 'platform.Token' as Metadata<string>

export enum AuthStatusCodes {
  AUTHENTICATON_OK,
  CLIENT_VALIDATE_REQUIRED
}
