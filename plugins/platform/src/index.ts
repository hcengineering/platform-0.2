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

export type PropType<T> = { __property: T }
export type AsString<T> = PropType<T> & string
export type AsNumber<T> = PropType<T> & number
export type AsRecord<T> = { [key: string]: PropType<any> } & PropType<T>

export interface Platform { }
export interface PlatformService { }

export type Metadata<T> = AsString<T> | { __metadata: void }
export type Service<S extends PlatformService> = Metadata<S>

/////

type ExtractType<T, X extends Record<string, Metadata<T>>> = { [P in keyof X]:
  X[P] extends Metadata<infer Z> ? Z : never
}

export class Platform {

  private COMPRESS_IDS = false
  private metadata = new Map<string, any>()

  private compressId(id: string): string {
    if (this.COMPRESS_IDS) {
      let h = 0
      for (let i = 0; i < id.length; i++)
        h = Math.imul(17, h) + id.charCodeAt(i) | 0

      return Math.abs(h).toString(36)
    }
    return id
  }

  getMetadata<T>(id: Metadata<T>): T {
    const result = this.metadata.get(id as string)
    if (!result)
      throw new Error('metadata not found: ' + id)
    return result
  }

  loadMetadata<T, X extends Record<string, Metadata<T>>>(ids: X, resources: ExtractType<T, X>) {
    for (const key in ids) {
      const id = ids[key]
      const resource = resources[key]
      if (!resource) {
        throw new Error(`no resource provided, key: ${key}, id: ${id}`)
      }
      this.metadata.set(id as string, resource)
    }
  }
}

//////

type Namespace = Record<string, Record<string, any>>

function transform<N extends Namespace>(prefix: string, namespaces: N, f: (id: string, value: any) => any): N {
  const result = {} as Namespace
  for (const namespace in namespaces) {
    const extensions = namespaces[namespace]
    const transformed = {} as Record<string, any>
    for (const key in extensions) {
      transformed[key] = f(prefix + '.' + namespace + '.' + key, extensions[key])
    }
    result[namespace] = transformed
  }
  return result as N
}

export function identify<N extends Namespace>(pluginId: string, namespace: N): N {
  return transform(pluginId, namespace, (id: string, value) => value === '' ? id : value)
}
