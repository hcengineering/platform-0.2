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

import { IntlMessageFormat, PrimitiveType } from 'intl-messageformat'

export type AnyFunc = (...args: any[]) => any
export type IntlString = string & { __intl_string: void }
export type Extension<T> = string & { __extension: T }

type Namespace = { [key: string]: { [key: string]: any } }
type Extend<X extends { [key: string]: any }> = { [P in keyof X]: Extension<X[P]> }

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

class Platform {

  private strings: Map<IntlString, string> = new Map()
  private imfCache: Map<IntlString, IntlMessageFormat> = new Map()
  private extensions = new Map<string, any>()
  // private metadata = new Map<object, any>()

  private COMPRESS_IDS = false

  private compressId(id: string): string {
    if (this.COMPRESS_IDS) {
      let h = 0
      for (let i = 0; i < id.length; i++)
        h = Math.imul(17, h) + id.charCodeAt(i) | 0

      return Math.abs(h).toString(36)
    }
    return id
  }

  identify<N extends Namespace>(pluginId: string, namespace: N): N {
    return transform(pluginId, namespace, (id: string, value) => value === '' ? this.compressId(id) : value)
  }

  /////////////////

  // setMetadata(object: object, metadata: any) {
  //   this.metadata.set(object, metadata)
  // }

  // getMetadata(object: object) {
  //   return this.metadata.get(object)
  // }

  /////////////////

  translate(string: IntlString, params?: Record<string, PrimitiveType> | undefined): string {
    const translation = this.strings.get(string)
    if (!translation) {
      return string
    }
    if (params) {
      let imf = this.imfCache.get(string)
      if (!imf) {
        imf = new IntlMessageFormat(translation, 'ru-RU')
        this.imfCache.set(string, imf)
      }
      return imf.format(params) as string
    }
    return translation
  }

  loadStrings(translations: { [key: string]: string }) {
    for (const key in translations) {
      this.strings.set(key as IntlString, translations[key])
    }
  }

  /////////////////

  setExtension<T>(id: Extension<T>, object: T): void {
    this.extensions.set(id, object)
  }

  getExtension<T>(extension: Extension<T>): T {
    const result = this.extensions.get(extension)
    if (!result) {
      throw new Error('extension not found: ' + extension)
    }
    return result
  }

  loadExtensions<X extends { [key: string]: any }>(ids: Extend<X>, extensions: X) {
    for (const key in ids) {
      const id = ids[key]
      const extension = extensions[key]
      if (!extension) {
        throw new Error(`no extension provided, key: ${key}, id: ${id}`)
      }
      this.setExtension(id, extension)
    }
  }

  invoke<M extends AnyFunc>(_this: object, method: Extension<M>, ...args: any[]): ReturnType<M> {
    return this.getExtension(method).apply(_this, args)
  }

}

export default new Platform()
