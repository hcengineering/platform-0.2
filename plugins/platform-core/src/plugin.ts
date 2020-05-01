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

export default new ExtensionRegistry()


//export default registry
