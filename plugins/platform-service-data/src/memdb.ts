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

import { Obj, Doc, Ref, Class, PropertyType } from '..'

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
  private objects = new Map<Ref<Doc>, Doc>()
  private byClass = new Map<Ref<Class<Doc>>, Doc[]>()

  private add(doc: Doc) {
    const id = doc._id
    if (this.objects.get(id))
      throw new Error('object already loaded: ' + id.toString())
    this.objects.set(id, doc)
  }

  get<D extends Doc>(doc: Ref<D>): D {
    const result = this.objects.get(doc)
    if (!result) {
      throw new Error('no document with id ' + doc)
    }
    return result as D
  }

  private getAllOfClass<D extends Doc>(clazz: Ref<Class<D>>): D[] {
    let docs = this.byClass.get(clazz) as D[]
    if (!docs) {
      docs = []
      this.byClass.set(clazz, docs)
    }
    return docs
  }

  private index(doc: Doc) {
    let clazz: Ref<Class<Doc>> | undefined = doc._class
    while (clazz) {
      this.getAllOfClass(clazz).push(doc)
      clazz = this.get(clazz).extends as Ref<Class<Doc>> // TODO: do not index by Obj
    }
  }

  findAll<D extends Doc>(clazz: Ref<Class<D>>, query: Partial<D>): D[] {
    const docs = this.getAllOfClass(clazz)
    let result = docs

    for (const propertyKey in query) {
      result = filterEq(result, propertyKey, (query as any)[propertyKey])
    }

    return result
  }

  load(docs: Doc[]) {
    docs.forEach(doc => this.add(doc))
    docs.forEach(doc => this.index(doc))
  }

}

