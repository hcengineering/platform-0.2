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
import { MemDb } from './memdb'
import { createESFunction, EasyScript } from './easyscript'

export interface Node {
  _class: Ref<Classifier<Doc>>
  _id: Ref<Doc>
  title: string | number
}

export class Graph {

  private modelDb: MemDb
  private graph = new Map<Ref<Doc>, Node>()
  private toStrings = new Map<Ref<Classifier<VDoc>>, (this: VDoc) => string>()

  constructor(modelDb: MemDb) {
    this.modelDb = modelDb
  }

  private getToString (_class: Ref<Classifier<VDoc>>): (this: VDoc) => string {
    const cached = this.toStrings.get(_class)
    if (cached) return cached

    // TODO: rework following with Instances

    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      const clazz = this.modelDb.get(cls) as Classifier<VDoc>
      const toString = clazz._attributes['toStr']
      if (toString) {
        const code = toString.type._default as EasyScript<() => string>
        console.log(`toString code for class ${_class}: ${code}`)
        const f = createESFunction<(this: VDoc) => string>(code)
        this.toStrings.set(_class, f)
        return f
      }
      cls = clazz._extends
    }
    const f = () => { console.log('no toString function defined for class: ' + _class); return 'no toString()' }
    this.toStrings.set(_class, f)
    return f
  }

  updateGraph (tx: Tx) {
    switch (tx._class) {
      case core.class.CreateTx: {
        const createTx = tx as CreateTx

        const _id = createTx._objectId
        const toString = this.getToString(createTx._objectClass)

        const node: Node = {
          _class: createTx._objectClass,
          _id,
          title: toString.call(createTx._attributes as unknown as VDoc) // TODO: manage to have a VDoc instance
        }
        this.graph.set(_id, node)
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
