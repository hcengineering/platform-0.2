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

/////////////////

import { AsString, PlatformService, Platform } from '@anticrm/platform-core/src/extension'

export type Extension<T> = AsString<T> & { __extension: void }

type AnyFunc = (...args: any[]) => any

export interface ExtensionService extends PlatformService {
  getExtension<T>(extension: Extension<T>): T
  loadExtensions<X extends { [key: string]: any }>(ids: Extend<X>, extensions: X): void
  invoke<M extends AnyFunc>(_this: object, method: Extension<M>, ...args: any[]): ReturnType<M>
}

type Extend<X extends { [key: string]: any }> = { [P in keyof X]: Extension<X[P]> }

class ExtensionServiceImpl {

  private extensions = new Map<Extension<any>, any>()

  private setExtension<T>(id: Extension<T>, object: T): void {
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

export default (platform: Platform): ExtensionService => { return new ExtensionServiceImpl() }
