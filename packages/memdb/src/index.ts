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

import { attributeKey, DocLayout, Ref, Class, Obj, Doc, Layout, LayoutType, ClassLayout } from '@anticrm/platform'
import { generateId } from './objectid'

export interface ModelDb {
  add (doc: DocLayout): void
  get (id: Ref<Doc>): DocLayout
  dump (): DocLayout[]

  find (clazz: Ref<Class<Doc>>, query: Layout): Promise<DocLayout[]>
  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Record<Exclude<keyof T, keyof E>, LayoutType>): void
  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Record<Exclude<keyof M, keyof Doc>, LayoutType>, _id?: Ref<M>): DocLayout
}

export class MemDb implements ModelDb {

  private objects = new Map<Ref<Doc>, DocLayout>()
  private byClass: Map<Ref<Class<Doc>>, DocLayout[]> | null = null

  objectsOfClass (_class: Ref<Class<Doc>>): DocLayout[] {
    console.log('indexing database...')
    if (!this.byClass) {
      this.byClass = new Map<Ref<Class<Doc>>, DocLayout[]>()
      for (const doc of this.objects.values()) {
        this.index(doc)
      }
    }
    return this.byClass.get(_class) ?? []
  }

  set (doc: DocLayout) {
    const id = doc._id
    if (this.objects.get(id)) { throw new Error('document added already ' + id) }
    this.objects.set(id, doc)
  }

  index (doc: DocLayout) {
    if (this.byClass === null) { throw new Error('index not created') }
    const byClass = this.byClass
    const hierarchy = this.getClassHierarchy(doc._class)
    hierarchy.forEach((_class) => {
      const cls = _class as Ref<Class<Doc>>
      const list = byClass.get(cls)
      if (list) { list.push(doc) }
      else { byClass.set(cls, [doc]) }
    })
  }

  add (doc: DocLayout) {
    this.set(doc)
    if (this.byClass) this.index(doc)
  }

  get (id: Ref<Doc>): DocLayout {
    const obj = this.objects.get(id)
    if (!obj) { throw new Error('document not found ' + id) }
    return obj
  }

  /// A S S I G N

  private findAttributeKey<T extends DocLayout> (cls: Ref<Class<Obj>>, key: string): string {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      const clazz = this.get(_class) as ClassLayout
      if ((clazz._attributes as any)[key] !== undefined) {
        return attributeKey(_class, key)
      }
      _class = clazz._extends
    }
    throw new Error('attribute not found: ' + key)
  }

  // from Builder
  assign (layout: DocLayout, _class: Ref<Class<Doc>>, values: Layout) {
    const l = layout as unknown as Layout
    for (const key in values) {
      if (key.startsWith('_')) {
        l[key] = values[key]
      } else {
        l[this.findAttributeKey(_class, key)] = values[key]
      }
    }
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Record<Exclude<keyof M, keyof Doc>, LayoutType>, _id?: Ref<M>): DocLayout {
    const layout = { _class, _id: _id ?? generateId() as Ref<Doc> } as DocLayout
    this.assign(layout, _class as Ref<Class<Doc>>, values)
    this.add(layout)
    return layout
  }

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Record<Exclude<keyof T, keyof E>, LayoutType>) {
    const doc = this.get(id)
    if (!doc._mixins) { doc._mixins = [] }
    const cls = clazz as Ref<Class<Doc>>
    doc._mixins.push(cls)
    this.assign(doc, cls, values as unknown as Layout)
  }

  getClassHierarchy (cls: Ref<Class<Doc>>): Ref<Class<Obj>>[] {
    const result = [] as Ref<Class<Obj>>[]
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      result.push(_class)
      _class = (this.get(_class) as ClassLayout)._extends
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

  loadModel (model: DocLayout[]) {
    for (const doc of model) { this.set(doc) }
    // if (this.byClass === null) { this.byClass = new Map<Ref<ClassLayout>, DocLayout[]>() }
    // for (const doc of model) { this.index(doc) }
  }

  // Q U E R Y
  async find (clazz: Ref<Class<Doc>>, query: Layout): Promise<DocLayout[]> {
    const byClass = this.objectsOfClass(clazz)
    return findAll(byClass, clazz, query)
  }

  async findOne (clazz: Ref<Class<Doc>>, query: Layout): Promise<DocLayout | undefined> {
    const result = await this.find(clazz, query)
    return result.length == 0 ? undefined : result[0]
  }
}

export function findAll (docs: DocLayout[], clazz: Ref<Class<Doc>>, query: Layout): DocLayout[] {
  let result = docs

  for (const key in query) {
    const condition = query[key]
    const aKey = attributeKey(clazz, key)
    result = filterEq(result, aKey, condition)
  }

  return result === docs ? docs.concat() : result
}

function filterEq (docs: DocLayout[], propertyKey: string, value: LayoutType): DocLayout[] {
  const result: DocLayout[] = []
  for (const doc of docs) {
    if (value === (doc as any)[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}
