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

import { DocDb, Ref, Doc } from '.'

export class MemDb implements DocDb {

  private objects = new Map<Ref<Doc>, Doc>()

  add (doc: Doc) {
    const id = doc._id
    if (this.objects.get(id)) { throw new Error('document added already ' + id) }
    this.objects.set(id, doc)
  }

  get<T extends Doc> (id: Ref<T>): T {
    const obj = this.objects.get(id)
    if (!obj) { throw new Error('document not found ' + id) }
    return obj as T
  }

  dump () {
    const result = []
    for (const doc of this.objects.values()) {
      result.push(doc)
    }
    return result
  }

  // loadModel (model: Doc[]) {
  //   for (const doc of model) {
  //     this.add(doc)
  //   }
  // }

}
