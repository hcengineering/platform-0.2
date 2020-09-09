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

import { core, Ref, Classifier, Doc, Tx, CreateTx, VDoc, Class, Obj, Attribute } from './core'
import { MemDb, mixinKey } from './memdb'
import { createESFunction, EasyScript } from './easyscript'

export interface Node {
  _class: Ref<Classifier<Doc>>
  _id: Ref<Doc>
  title: string | number
}

const NULL = '<null>'
const primaryKey = mixinKey(core.mixin.Indices, 'primary')

export class Graph {

  private modelDb: MemDb
  private graph = new Map<Ref<Doc>, Node>()
  private primaries = new Map<Ref<Classifier<VDoc>>, string>()

  constructor(modelDb: MemDb) {
    this.modelDb = modelDb
  }

  private getPrimary (_class: Ref<Classifier<VDoc>>): string | null {
    const cached = this.primaries.get(_class)
    if (cached) return cached === NULL ? null : cached

    // TODO: rework following with Instances

    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      const clazz = this.modelDb.get(cls) as Classifier<VDoc>
      const primary = (clazz as any)[primaryKey]
      if (primary) {
        console.log(`primary code for class ${_class}: ${primary}`)
        this.primaries.set(_class, primary)
        return primary
      }
      cls = clazz._extends
    }
    this.primaries.set(_class, NULL)
    return null
  }

  updateGraph (tx: Tx) {
    switch (tx._class) {
      case core.class.CreateTx: {
        const createTx = tx as CreateTx

        const _id = createTx._objectId
        const primary = this.getPrimary(createTx._objectClass)

        if (primary) {
          const node: Node = {
            _class: createTx._objectClass,
            _id,
            title: createTx._attributes[primary] as string
          }
          this.graph.set(_id, node)
        }

        break
      }
    }
  }

  load (nodes: Node[]) {
    for (const node of nodes) {
      this.graph.set(node._id, node)
    }
  }

  dump (): Node[] {
    const result = []
    for (const value of this.graph.values()) {
      result.push(value)
    }
    return result
  }

}
