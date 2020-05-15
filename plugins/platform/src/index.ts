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

export type PropType<T> = { __property: T }
export type AsString<T> = string & PropType<T>
export type AsNumber<T> = number & PropType<T>

export type Metadata<T> = AsString<T> & { __metadata: void }

export type PluginId<S extends Plugin> = Metadata<S>
export interface Platform { }
export interface Plugin {
  readonly platform: Platform
  // readonly pluginId: PluginId<Plugin>
}

export interface PluginDescriptor<P extends Plugin> {
  id: PluginId<P>,
  deps: PluginId<Plugin>[]
}

type PluginModule<P extends Plugin> = Promise<{
  default: (platform: Platform) => P
}>

//////////////

type ExtractType<T, X extends Record<string, Metadata<T>>> = { [P in keyof X]:
  X[P] extends Metadata<infer Z> ? Z : never
}

export class Platform {

  private COMPRESS_IDS = false

  compressId(id: string): string {
    if (this.COMPRESS_IDS) {
      let h = 0
      for (let i = 0; i < id.length; i++)
        h = Math.imul(17, h) + id.charCodeAt(i) | 0

      return Math.abs(h).toString(36)
    }
    return id
  }

  /////

  private plugins = new Map<PluginId<Plugin>, Plugin>()
  private locations = [] as [PluginDescriptor<Plugin>, PluginModule<Plugin>][]

  // temporary method for testing purposes
  getPluginSync<T extends Plugin>(id: PluginId<T>): T {
    const plugin = this.plugins.get(id)
    if (plugin) return plugin as T
    throw new Error('plugin not loaded: ' + id)
  }

  setPlugin<T extends Plugin>(id: PluginId<T>, plugin: T): void {
    this.plugins.set(id, plugin)
  }

  private getLocation<T extends Plugin>(id: PluginId<T>): [PluginDescriptor<T>, PluginModule<T>] {
    for (const location of this.locations) {
      if (location[0].id === id)
        return location as [PluginDescriptor<T>, PluginModule<T>]
    }
    throw new Error('no descriptor for: ' + id)
  }

  async getPlugin<T extends Plugin>(id: PluginId<T>): Promise<T> {
    const plugin = this.plugins.get(id)
    if (plugin) return plugin as T
    const location = this.getLocation(id)
    const descriptor = location[0]
    const deps = await Promise.all(descriptor.deps.map(plugin => this.getPlugin(plugin)))
    return location[1].then(module => module.default).then(f => f(this))
  }

  addLocation<P extends Plugin>(plugin: PluginDescriptor<P>, module: PluginModule<P>) {
    this.locations.push([plugin, module])
  }

  /////

  private metadata = new Map<string, any>()

  getMetadata<T>(id: Metadata<T>): T {
    return this.metadata.get(id as string)
  }

  setMetadata<T>(id: Metadata<T>, value: T): void {
    this.metadata.set(id as string, value)
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

export function identify<N extends Namespace>(pluginId: PluginId<Plugin>, namespace: N): N {
  return transform(pluginId, namespace, (id: string, value) => value === '' ? id : value)
}

export function plugin<P extends Plugin, N extends Namespace>(id: PluginId<P>, deps: PluginId<Plugin>[], namespace: N): PluginDescriptor<P> & N {
  return { id, deps, ...identify(id, namespace) }
}

export default new Platform()
