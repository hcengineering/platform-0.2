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

import { Session, Query } from './types'
import { Obj, Doc, Ref, Bag, Class, PropertyType, Konstructor } from './types'
import registry, { Extension } from './plugin'

interface ObjLayout {
  _class: Ref<Class<Obj>>

  [key: string]: PropertyType
}

interface DocLayout extends ObjLayout {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
}

interface ClassLayout extends DocLayout {
  extends?: Ref<Class<Obj>>
  konstructor?: Extension<Konstructor<Obj>>
}

function filterEq(docs: DocLayout[], propertyKey: string, value: PropertyType): DocLayout[] {
  const result = []
  for (const doc of docs) {
    if (value === doc[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}

function findAll(docs: DocLayout[], query: Partial<Doc>): DocLayout[] {
  let result = docs

  for (const propertyKey in query) {
    result = filterEq(result, propertyKey, (query as Bag<PropertyType>)[propertyKey])
  }

  return result
}

class MemDb {
  private objects = new Map<Ref<Doc>, DocLayout>()
  private byClass = new Map<Ref<Class<Doc>>, DocLayout[]>()

  private add(doc: DocLayout) {
    const id = doc._id
    if (this.objects.get(id))
      throw new Error('object already loaded: ' + id.toString())
    this.objects.set(id, doc)
  }

  get(doc: Ref<Doc>): DocLayout {
    const result = this.objects.get(doc)
    if (!result) {
      throw new Error('no document with id ' + doc)
    }
    return result
  }

  getAllOfClass(clazz: Ref<Class<Doc>>): DocLayout[] {
    let docs = this.byClass.get(clazz)
    if (!docs) {
      docs = []
      this.byClass.set(clazz, docs)
    }
    return docs
  }

  private getClassLayout(clazz: Ref<Class<Obj>>): ClassLayout {
    return this.objects.get(clazz) as ClassLayout
  }

  private index(doc: DocLayout) {
    let clazz: Ref<Class<Doc>> | undefined = doc._class
    while (clazz) {
      this.getAllOfClass(clazz).push(doc)
      clazz = this.getClassLayout(clazz).extends as Ref<Class<Doc>> // TODO: do not index by Obj
    }
  }

  load(docs: DocLayout[]) {
    docs.forEach(doc => this.add(doc))
    docs.forEach(doc => this.index(doc))
  }

}

////////////////////////////////

class Instantiator implements ProxyHandler<ObjLayout> {
  private memdb: MemSession

  constructor(memdb: MemSession) {
    this.memdb = memdb
  }

  get(target: ObjLayout, key: PropertyKey): any {
    const value = Reflect.get(target, key)
    if (!value) {
      return this.memdb.getPrototype(target._class)
    }
    if (typeof value === 'object' && value.hasOwnProperty('_class')) {
      return new Proxy(value, this.memdb.instantiator)
    }
    return value
  }
}

class MemSession implements Session {

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, object>()
  readonly instantiator: Instantiator

  constructor(memdb: MemDb) {
    this.memdb = memdb
    this.instantiator = new Instantiator(this)
  }

  getPrototype(clazz: Ref<Class<Obj>>): object {
    const proto = this.prototypes.get(clazz)
    if (proto) {
      return proto
    }
    const classInstance = this.memdb.get(clazz) as ClassLayout
    if (classInstance.konstructor) {
      const konstructor = registry.get(classInstance.konstructor)
      this.prototypes.set(clazz, konstructor.prototype)
      return konstructor.prototype
    }
    throw new Error('TODO: no constructor for ' + clazz)
  }

  private instantiate(obj: ObjLayout): Obj {
    return new Proxy(obj, this.instantiator) as unknown as Obj
  }

  getInstance<T extends Doc>(ref: Ref<T>): T {
    return this.instantiate(this.memdb.get(ref)) as T
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[] {
    const layouts = findAll(this.memdb.getAllOfClass(clazz), query)
    return layouts.map(layout => this.instantiate(layout)) as T[]
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined {
    const result = this.find(clazz, query)
    return result.length > 0 ? result[0] : undefined
  }

}
