//
// Copyright © 2020 Anticrm Platform Contributors.
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

import { Component, Status, Severity, identify, Namespace } from '@anticrm/status'
import { monitor } from './event'
import { Code } from './status'

import mergeWith from 'lodash/mergeWith'

/** Base interface for a plugin or platform service. */
export interface Service {} // eslint-disable-line @typescript-eslint/no-empty-interface

/** Plugin identifier. */
export type Plugin<S extends Service> = Component & { __plugin: S }
type AnyPlugin = Plugin<Service>

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

interface PluginModule<P extends Service, D extends PluginDependencies> {
  default: (deps: PluginServices<D>) => Promise<P>
}
// type AnyPluginModule = PluginModule<Service, PluginDependencies>

type PluginLoader<P extends Service, D extends PluginDependencies> = () => Promise<PluginModule<P, D>>
type AnyPluginLoader = PluginLoader<Service, PluginDependencies>

const services = new Map<AnyPlugin, Service>()
const locations = [] as Array<[AnyDescriptor, AnyPluginLoader]>
const running = new Map<AnyPlugin, Service>()

export function addLocation<P extends Service, X extends PluginDependencies> (
  plugin: PluginDescriptor<P, X>,
  module: PluginLoader<P, X>
): void {
  locations.push([plugin, (module as unknown) as AnyPluginLoader])
}

export async function getPlugin<T extends Service> (id: Plugin<T>): Promise<T> {
  const service = services.get(id)
  if (service !== undefined) {
    return service as T
  } else {
    return await loadPlugin(id).then((service) => {
      services.set(id, service)
      return service as T
    })
  }
}

function getLocation (id: AnyPlugin): [AnyDescriptor, AnyPluginLoader] {
  for (const location of locations) {
    if (location[0].id === id) {
      return location
    }
  }
  throw new Error('no location provided for plugin: ' + id)
}

// TODO: resolve in parallel
async function resolveDependencies (deps: PluginDependencies): Promise<{ [key: string]: Service }> {
  const plugins = []
  const result: { [key: string]: Service } = {}
  for (const key in deps) {
    const id = deps[key]
    plugins.push(
      getPlugin(id).then((service) => {
        result[key] = service
      })
    )
  }
  return Promise.all(plugins).then(() => result)
}

async function loadPlugin<T extends Service> (id: Plugin<T>): Promise<Service> {
  const location = getLocation(id)
  const deps = await resolveDependencies(location[0].deps)

  const loaderPromise = location[1]()

  // if (id !== 'ui') {
  //   loaderPromise = new Promise<AnyPluginModule>((resolve, reject) => {
  //     setInterval(() => {
  //       location[1]().then(result => resolve(result)).catch(err => reject(err))
  //     }, 3000)
  //   })
  // } else {
  // loaderPromise = location[1]()
  // }

  const status = new Status(Severity.INFO, Code.LoadingPlugin, { plugin: id })
  const loadedPlugin = await monitor(status, loaderPromise)
  const f = loadedPlugin.default
  const service = await f(deps)
  running.set(id, service)
  return service
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

export function mergeIds<P extends Service, X extends PluginDependencies, D extends PluginDescriptor<P, X>, N extends Namespace> (a: D, b: N): D & N {
  return mergeWith({}, a, identify(a.id, b), (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}
