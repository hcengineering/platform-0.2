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

import { Ref, Classifier, Doc, Class, Title, Storage, Backlinks } from '@anticrm/core'
import core from '.'

interface Node {
  _class: Ref<Class<Doc>>
  links: Link[]
}

interface Link {
  _class: Ref<Classifier<Doc>>
  _id: Ref<Doc>
}

function hasLink (node: Node, _id: Ref<Doc>): boolean {
  for (const link of node.links) {
    if (link._id === _id) { return true }
  }
  return false
}

export class Graph implements Storage {

  private graph = new Map<Ref<Doc>, Node>()

  find (_id: Ref<Doc>) {
    return this.graph.get(_id)
  }

  async store (doc: Doc): Promise<void> {
    if (doc._class !== core.class.Backlinks) {
      throw new Error('assert doc._class !== core.class.Backlinks')
    }

    const backlinks = doc as Backlinks

    for (const backlink of backlinks.backlinks) {
      let node = this.graph.get(backlink._backlinkId)
      if (!node) {
        node = {
          _class: backlink._backlinkClass,
          links: []
        }
        this.graph.set(backlink._backlinkId, node)
      }
      if (!hasLink(node, backlinks._objectId)) {
        node.links.push({
          _class: backlinks._objectClass,
          _id: backlinks._objectId
        })
      }
    }
  }

  async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    console.log('graph push')
  }

  async update (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void> {
    console.log('graph update')
  }

  async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<void> {
    console.log('graph remove')
  }

}
