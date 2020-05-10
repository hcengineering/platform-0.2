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
  hierarchy = new Map<Ref<Class<Obj>>, Ref<Class<Obj>>[]>()

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
        const container = {
          _id,
          _classes: []
        }
        this.objects.set(_id, container) // TODO: update indexes
        return container
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

  private getSubclasses(clazz: Ref<Class<Obj>>): Ref<Class<Obj>>[] {
    let result = this.hierarchy.get(clazz)
    if (!result) {
      result = [] as Ref<Class<Obj>>[]
      this.hierarchy.set(clazz, result)
    }
    return result
  }

  private addSubclass(clazz: Ref<Class<Obj>>, subclass: Ref<Class<Obj>>) {
    const subclasses = this.getSubclasses(clazz)
    if (!subclasses.includes(subclass)) {
      subclasses.push(subclass)
    }
  }

  narrow<T extends Obj>(clazz: Ref<Class<T>>): Ref<Class<T>> {
    while (true) {
      const subclasses = this.getSubclasses(clazz)
      if (subclasses.length === 1)
        clazz = subclasses[0] as Ref<Class<T>>
      else
        return clazz
    }
  }

  index(container: Container) {
    container._classes.forEach(clazz => {
      let _class = clazz as Ref<Class<Obj>> | undefined
      while (_class) {
        this.getAllOfClass(_class).push(container)
        const superClass = this.objects.get(_class)?._extends as Ref<Class<Obj>>
        if (superClass) {
          this.addSubclass(superClass, _class)
        }
        _class = superClass
      }
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

  dump(): Container[] {
    const result = [] as Container[]
    this.objects.forEach(doc => result.push(doc))
    return result
  }
}

