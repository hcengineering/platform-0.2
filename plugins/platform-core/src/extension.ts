//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

export type Extension<T> = string & { __extension: T }

///////

type Namespace = { [key: string]: { [key: string]: any } }

function transform<N extends Namespace>(prefix: string, namespaces: N, f: (id: string, value: any) => any): N {
  const result = {} as Namespace
  for (const namespace in namespaces) {
    const extensions = namespaces[namespace]
    const transformed = {} as { [key: string]: any }
    for (const key in extensions) {
      transformed[key] = f(prefix + '.' + namespace + '.' + key, extensions[key])
    }
    result[namespace] = transformed
  }
  return result as N
}

const COMPRESS = false

function compressId(id: string): string {
  if (COMPRESS) {
    let h = 0
    for (let i = 0; i < id.length; i++)
      h = Math.imul(17, h) + id.charCodeAt(i) | 0

    return Math.abs(h).toString(36)
  }
  return id
}

export function identify<N extends Namespace>(pluginId: string, namespace: N): N {
  return transform(pluginId, namespace, (id: string, value) => value === '' ? compressId(id) : value)
}

///////

class ExtensionRegistry {
  private extensions = new Map<string, any>()

  set<T>(id: string, object: T): Extension<T> {
    this.extensions.set(id, object)
    return id as Extension<T>
  }

  get<T>(extension: Extension<T>): T {
    const result = this.extensions.get(extension)
    if (!result) {
      throw new Error('extension not found: ' + extension)
    }
    return result
  }
}

const registry = new ExtensionRegistry()

//////

type Extend<X extends { [key: string]: any }> = { [P in keyof X]: Extension<X[P]> }

export function loadExtensions<X extends { [key: string]: any }>(ids: Extend<X>, extensions: X) {
  for (const key in ids) {
    const id = ids[key]
    const extension = extensions[key]
    if (!extension) {
      throw new Error(`no extension provided, key: ${key}, id: ${id}`)
    }
    registry.set(id, extension)
  }
}

//////

export class Plugin {
  readonly id: string
  private extensions: () => void

  constructor(id: string, extensions: () => void) {
    this.id = id
    this.extensions = extensions
  }

  start(): void {
    this.extensions()
  }
}

//////

export default registry
