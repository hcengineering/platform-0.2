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

import { Obj, Doc, Ref, Class, PropertyType, Container, ContainerId } from '.'

function filterEq(docs: any, propertyKey: string, value: PropertyType): any[] {
  const result = []
  for (const doc of docs) {
    if (value === doc[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}

export class MemDb {
  private objects = new Map<Ref<Doc>, Container>()
  private byClass = new Map<Ref<Class<Obj>>, Container[]>()

  private add(doc: Container) {
    const id = doc._id
    if (this.objects.get(id))
      throw new Error('container already loaded: ' + id.toString())
    this.objects.set(id, doc)
  }

  get(_id: ContainerId, create?: boolean): Container {
    const result = this.objects.get(_id)
    if (!result) {
      if (create) {
        return {
          _id,
          _classes: []
        }
      }
      throw new Error('no container with id ' + _id)
    }
    return result
  }

  pick(id: ContainerId): Container | undefined {
    return this.objects.get(id)
  }

  private getAllOfClass(clazz: Ref<Class<Obj>>): Container[] {
    let docs = this.byClass.get(clazz)
    if (!docs) {
      docs = []
      this.byClass.set(clazz, docs)
    }
    return docs
  }

  private index(container: Container) {
    container._classes.forEach(clazz => {
      this.getAllOfClass(clazz).push(container)
    })
  }

  findAll<D extends Doc>(clazz: Ref<Class<D>>, query: Partial<D>): Container[] {
    const docs = this.getAllOfClass(clazz)
    let result = docs

    for (const propertyKey in query) {
      result = filterEq(result, propertyKey, (query as any)[propertyKey])
    }

    return result
  }

  load(docs: Container[]) {
    docs.forEach(doc => this.add(doc))
    docs.forEach(doc => this.index(doc))
  }

}

