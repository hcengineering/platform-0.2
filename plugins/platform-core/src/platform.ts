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

type Extend<X extends { [key: string]: any }> = { [P in keyof X]: Extension<X[P]> }

// interface Plugin {
//   pluginId: string
//   start: (platform: Platform) => void
// }

export class Platform {

  private strings: Map<IntlString, string> = new Map()
  private imfCache: Map<IntlString, IntlMessageFormat> = new Map()
  private extensions = new Map<string, any>()
  // private metadata = new Map<object, any>()

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
