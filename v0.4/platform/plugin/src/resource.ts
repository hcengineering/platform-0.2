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

import { Plugin, Service, getPlugin } from './plugin'

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
  const plugin = resource.substring(index + 1, dot) as Plugin<Service>
  const id = resource.substring(dot)
  return {
    kind,
    plugin,
    id
  }
}

const resources = new Map<Resource<any>, any>()
const resolvingResources = new Map<Resource<any>, Promise<any>>()

/** Peek does not resolve resource. Return resource if it's already loaded. */
export function peekResource<T> (resource: Resource<T>): T | undefined {
  return resources.get(resource)
}

export async function getResource<T> (resource: Resource<T>): Promise<T> {
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

export function setResource<T> (resource: Resource<T>, value: T): void {
  resources.set(resource, value)
}

