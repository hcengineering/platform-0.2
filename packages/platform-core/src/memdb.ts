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

import { DocDb, Ref, Doc, Class, Obj, PropertyType } from '.'
import { generateId } from './objectid'
import { attributeKey } from './plugin'

type Layout = { [key: string]: PropertyType }

export class MemDb implements DocDb {

  private objects = new Map<Ref<Doc>, Doc>()
  private byClass: Map<Ref<Class<Obj>>, Doc[]> | null = null

  set (doc: Doc) {
    const id = doc._id
    if (this.objects.get(id)) { throw new Error('document added already ' + id) }
    this.objects.set(id, doc)
  }

  index (doc: Doc) {
    if (this.byClass === null) { throw new Error('index not created') }
    const byClass = this.byClass
    const hierarchy = this.getClassHierarchy(doc._class)
    hierarchy.forEach((_class) => {
      const list = byClass.get(_class)
      if (list) { list.push(doc) }
      else { byClass.set(_class, [doc]) }
    })
  }

  add (doc: Doc) {
    this.set(doc)
    if (this.byClass) this.index(doc)
  }

  get<T extends Doc> (id: Ref<T>): T {
    const obj = this.objects.get(id)
    if (!obj) { throw new Error('document not found ' + id) }
    return obj as T
  }

  /// A S S I G N

  private findAttributeKey<T extends Doc> (cls: Ref<Class<T>>, key: string): string {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      const clazz = this.get(_class)
      if ((clazz._attributes as any)[key] !== undefined) {
        return attributeKey(_class, key)
      }
      _class = clazz._extends
    }
    throw new Error('attribute not found: ' + key)
  }

  // from Builder
  assign<T extends Doc> (layout: Layout, _class: Ref<Class<T>>, values: Layout) {
    for (const key in values) {
      if (key.startsWith('_')) {
        layout[key] = values[key]
      } else {
        layout[this.findAttributeKey(_class, key)] = values[key]
      }
    }
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): M {
    const layout = { _class, _id: _id ?? generateId() as Ref<Doc> } as Doc
    this.assign(layout as unknown as Layout, _class, values as unknown as Layout)
    this.add(layout)
    return layout as M
  }

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Pick<T, Exclude<keyof T, keyof E>>) {
    const doc = this.get(id)
    if (!doc._mixins) { doc._mixins = [] }
    doc._mixins.push(clazz as Ref<Class<Doc>>)
    this.assign(doc as unknown as Layout, clazz, values as unknown as Layout)
  }

  getClassHierarchy (cls: Ref<Class<Obj>>): Ref<Class<Obj>>[] {
    const result = [] as Ref<Class<Obj>>[]
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      result.push(_class)
      _class = this.get(_class)._extends
    }
    return result
  }

  dump () {
    const result = []
    for (const doc of this.objects.values()) {
      result.push(doc)
    }
    return result
  }

  loadModel (model: Doc[]) {
    for (const doc of model) { this.set(doc) }
    if (this.byClass === null) { this.byClass = new Map<Ref<Class<Obj>>, Doc[]>() }
    for (const doc of model) { this.index(doc) }
  }

  // Q U E R Y
  async find<T extends Doc> (clazz: Ref<Class<T>>, query: Partial<T>): Promise<T[]> {
    console.log(this.byClass?.get(clazz))
    const result = (this.byClass?.get(clazz) ?? []) as T[]
    return findAll(result, clazz, query)
  }

  async findOne<T extends Doc> (clazz: Ref<Class<T>>, query: Partial<T>): Promise<T | undefined> {
    const result = await this.find(clazz, query)
    return result.length == 0 ? undefined : result[0]
  }
}

function findAll<T extends Doc> (docs: T[], clazz: Ref<Class<T>>, query: Partial<T>): T[] {
  let result = docs

  for (const key in query) {
    const condition = query[key]
    const aKey = attributeKey(clazz, key)
    result = filterEq(result, aKey, condition as PropertyType)
  }

  return result as T[]
}

function filterEq<T extends Doc> (docs: T[], propertyKey: string, value: PropertyType): T[] {
  const result: T[] = []
  for (const doc of docs) {
    if (value === (doc as any)[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}
