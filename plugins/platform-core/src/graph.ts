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

import core, { Backlinks, TxContext, Storage, Ref, Classifier, Doc, Class, AnyLayout, StringProperty } from '@anticrm/core'

interface Link {
  _class: Ref<Classifier<Doc>>
  _id: Ref<Doc>
  pos: number
}
interface Node {
  _class: Ref<Class<Doc>>
  links: Link[]
}

function hasLink (node: Node, _id: Ref<Doc>): boolean {
  for (const link of node.links) {
    if (link._id === _id) { return true }
  }
  return false
}

export class Graph implements Storage {
  private graph = new Map<Ref<Doc>, Node>()

  async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    const _id = query._objectId as Ref<Doc>
    const node = this.graph.get(_id)
    const result = [] as Doc[]

    if (node) {
      const backlinks: Backlinks = {
        _id: 'transient' as Ref<Doc>,
        _class: core.class.Backlinks,
        _objectClass: node?._class,
        _objectId: _id,
        backlinks: node.links.map(link => ({
          _backlinkId: link._id,
          _backlinkClass: link._class,
          pos: link.pos
        }))
      }
      result.push(backlinks)
    }
    return result as T[]
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
    const res = await this.find(_class, query)
    return res.length > 0 ? res[0] : undefined
  }

  async store (ctx: TxContext, doc: Doc): Promise<void> {
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
          _id: backlinks._objectId,
          pos: backlink.pos
        })
      }
    }
  }

  async push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void> { // eslint-disable-line
    console.log('graph push')
  }

  async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null, attributes: AnyLayout): Promise<void> { // eslint-disable-line
    console.log('graph update')
  }

  async remove (ctx: TxContext, _class: Ref<Class<Doc>>, doc: Ref<Doc>, _query: AnyLayout | null): Promise<void> { // eslint-disable-line
    console.log('graph remove')
  }
}
