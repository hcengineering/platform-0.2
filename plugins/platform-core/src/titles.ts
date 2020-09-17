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

import { Ref, Classifier, Doc, Class, Title, Storage, AnyLayout } from '@anticrm/core'
import core from '.'

export interface Node {
  _class: Ref<Classifier<Doc>>
  _id: Ref<Doc>
  title: string
}

export class Titles implements Storage {

  private graph = new Map<Ref<Doc>, Node>()
  // private titleRef = ref(0)

  async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    const result = [] as Doc[]
    if (_class as string !== core.class.Title) {
      throw new Error('assert _class !== core.class.Title')
    }
    const prefix = query['title'] as string
    for (const node of this.graph.values()) {
      if (node.title.startsWith(prefix)) {
        const title: Title = {
          _id: 'transient' as Ref<Doc>,
          _class: core.class.Title,
          _objectClass: node._class,
          _objectId: node._id,
          title: node.title
        }
        result.push(title)
      }
    }
    return result as T[]
  }

  queryTitle (_id: Ref<Doc>): string {
    // const touch = this.titleRef.value
    const node = this.graph.get(_id)
    return node ? node.title as string : 'not found'
  }

  async store (doc: Doc): Promise<void> {
    if (doc._class !== core.class.Title) {
      throw new Error('assert doc._class !== core.class.Title')
    }

    const title = doc as Title
    this.graph.set(title._objectId, {
      _class: title._objectClass,
      _id: title._objectId,
      title: title.title as string
    })
  }

  async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    console.log('graph push')
  }

  async update (_class: Ref<Class<Doc>>, selector: any, attributes: any): Promise<void> {
    console.log('titles update', selector, attributes)
    const _id = selector._objectId
    const title = attributes.title
    const node = this.graph.get(_id)
    if (node) {
      node.title = attributes.title
    }
  }

  async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<void> {
    console.log('graph remove')
  }

}
