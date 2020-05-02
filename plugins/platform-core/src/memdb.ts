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

import { Obj, Doc, Ref, Bag, Class, PropertyType, Layout, Mixin } from './types'

type ObjLayout = Layout<Obj>
type DocLayout = Layout<Doc>
type ClassLayout = Layout<Class<Obj>>

function filterEq(docs: Bag<PropertyType>[], propertyKey: string, value: PropertyType): Bag<PropertyType>[] {
  const result = []
  for (const doc of docs) {
    if (value === doc[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}

export class MemDb {
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

  private getAllOfClass(clazz: Ref<Class<Doc>>): DocLayout[] {
    let docs = this.byClass.get(clazz)
    if (!docs) {
      docs = []
      this.byClass.set(clazz, docs)
    }
    return docs
  }

  private getClassLayout(clazz: Ref<Class<Obj>>): ClassLayout {
    return this.get(clazz) as ClassLayout
  }

  private index(doc: DocLayout) {
    let clazz: Ref<Class<Doc>> | undefined = doc._class
    while (clazz) {
      this.getAllOfClass(clazz).push(doc)
      clazz = this.getClassLayout(clazz).extends as Ref<Class<Doc>> // TODO: do not index by Obj
    }
  }

  findAll(clazz: Ref<Class<Doc>>, query: Partial<Doc>): DocLayout[] {
    const docs = this.getAllOfClass(clazz)
    let result = docs as Bag<PropertyType>[]

    for (const propertyKey in query) {
      result = filterEq(result, propertyKey, (query as Bag<PropertyType>)[propertyKey])
    }

    return result as DocLayout[]
  }

  load(docs: DocLayout[]) {
    docs.forEach(doc => this.add(doc))
    docs.forEach(doc => this.index(doc))
  }

}

