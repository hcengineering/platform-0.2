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

import { core, Ref, Class, Doc, Tx, CreateTx } from './core'

export interface Node {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
  title: string | number
}

export interface GraphService {
  updateGraph (tx: Tx): void
}

export default (): GraphService => {

  const graph = new Map<Ref<Doc>, Node>()

  function updateGraph (tx: Tx) {
    switch (tx._class) {
      case core.class.CreateTx: {
        const createTx = tx as CreateTx

        const title = 'title'
        const _id = createTx._objectId

        const node: Node = {
          _class: createTx._objectClass,
          _id,
          title
        }
        graph.set(_id, node)
        break
      }
    }
  }

  return {
    updateGraph
  }
}