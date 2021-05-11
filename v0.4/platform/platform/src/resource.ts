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
import type { Resource } from '@anticrm/status'

export type { Resource }

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
    if (resolving !== undefined) {
      return await resolving
    }

    const info = getResourceInfo(resource)
    resolving = getPlugin(info.plugin)
      .then(() => {
        const value = resources.get(resource)
        if (value === undefined) {
          throw new Error('resource not loaded: ' + resource)
        }
        return value
      })
      .finally(() => {
        resolvingResources.delete(resource)
      })

    resolvingResources.set(resource, resolving)
    return resolving
  }
}

export function setResource<T> (resource: Resource<T>, value: T): void {
  resources.set(resource, value)
}
