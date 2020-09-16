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

import { generateId } from './objectid'
import { AnyLayout, Class, Classifier, ClassifierKind, Doc, Mixin, Obj, PropertyType, Ref } from './core'
import { Domain, QueryResult } from './domain'

export function mixinKey (mixin: Ref<Mixin<Doc>>, key: string): string {
  return key + '|' + mixin.replace('.', '~')
}

export const MODEL_DOMAIN = 'model'

export class Model implements Domain {
  private domain: string
  private objects = new Map<Ref<Doc>, Doc>()
  private byClass: Map<Ref<Class<Doc>>, Doc[]> | null = null

  constructor(domain: string) {
    this.domain = domain
  }

  protected objectsOfClass (_class: Ref<Class<Doc>>): Doc[] {
    if (!this.byClass) {
      this.byClass = new Map<Ref<Class<Doc>>, Doc[]>()
      for (const doc of this.objects.values()) {
        this.index(doc)
      }
    }
    return this.byClass.get(_class) ?? []
  }

  protected attributeKey (clazz: Classifier<Obj>, key: string): string {
    return (clazz._kind === ClassifierKind.MIXIN) ? mixinKey(clazz._id as Ref<Mixin<Doc>>, key) : key
  }

  private set (doc: Doc) {
    const id = doc._id
    if (this.objects.get(id)) {
      throw new Error('document added already ' + id)
    }
    this.objects.set(id, doc)
  }

  private index (doc: Doc) {
    if (this.byClass === null) {
      throw new Error('index not created')
    }
    const byClass = this.byClass
    const hierarchy = this.getClassHierarchy(doc._class)
    hierarchy.forEach((_class) => {
      const cls = _class as Ref<Class<Doc>>
      const list = byClass.get(cls)
      if (list) {
        list.push(doc)
      } else {
        byClass.set(cls, [doc])
      }
    })
  }

  add (doc: Doc) {
    this.set(doc)
    if (this.byClass) this.index(doc)
  }

  get (id: Ref<Doc>): Doc {
    const obj = this.objects.get(id)
    if (!obj) {
      throw new Error('document not found ' + id)
    }
    return obj
  }

  // D O M A I N

  getDomain (id: Ref<Class<Doc>>): string {
    let clazz = this.objects.get(id) as Class<Doc> | undefined
    while (clazz) {
      if (clazz._domain) return clazz._domain as string
      clazz = clazz._extends ? this.objects.get(clazz._extends) as Class<Doc> : undefined
    }
    throw new Error('no domain found for class: ' + id)
  }

  getClass (_class: Ref<Class<Doc>>): Ref<Class<Doc>> {
    let cls = _class
    while (cls) {
      const clazz = this.get(cls) as Class<Doc>
      if (clazz._kind === ClassifierKind.CLASS)
        return cls
      cls = clazz._extends as Ref<Class<Doc>>
    }
    throw new Error('class not found in hierarchy: ' + _class)
  }

  /// A S S I G N

  private findAttributeKey<T extends Doc> (cls: Ref<Class<Obj>>, key: string): string {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      const clazz = this.get(_class) as Class<Obj>
      if ((clazz._attributes as any)[key] !== undefined) {
        return this.attributeKey(clazz, key)
      }
      _class = clazz._extends
    }
    throw new Error('attribute not found: ' + key)
  }

  // from Builder
  assign (layout: AnyLayout, _class: Ref<Classifier<Doc>>, values: AnyLayout) {
    const l = layout as unknown as AnyLayout
    const r = values as unknown as AnyLayout
    for (const key in values) {
      if (key.startsWith('_')) {
        l[key] = r[key]
      } else {
        l[this.findAttributeKey(_class, key)] = r[key]
      }
    }
  }

  generateId (): Ref<Doc> {
    return generateId() as Ref<Doc>
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): Doc {
    const layout = { _class, _id: _id ?? this.generateId() }
    this.assign(layout, _class, values as unknown as AnyLayout)
    // this.add(layout)
    return layout
  }

  mixinDocument<T extends E, E extends Doc> (doc: E, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    if (!doc._mixins) {
      doc._mixins = []
    }
    doc._mixins.push(clazz)
    this.assign(doc as unknown as AnyLayout, clazz as Ref<Classifier<Doc>>, values as unknown as AnyLayout)
  }

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    this.mixinDocument(this.get(id) as E, clazz, values)
  }

  getClassHierarchy (cls: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Ref<Class<Obj>>[] {
    const result = [] as Ref<Class<Obj>>[]
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class && _class !== top) {
      result.push(_class)
      _class = (this.get(_class) as Class<Obj>)._extends
    }
    return result
  }

  is (_class: Ref<Class<Obj>>, a: Ref<Class<Obj>>): boolean {
    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      if (cls === a) {
        return true
      }
      cls = (this.get(cls) as Class<Obj>)._extends
    }
    return false
  }

  dump (): Doc[] {
    const result = []
    for (const doc of this.objects.values()) {
      result.push(doc)
    }
    return result
  }

  async loadDomain (domain: string): Promise<Doc[]> {
    if (this.domain !== domain) {
      throw new Error('domain does not match')
    }
    return this.dump()
  }

  loadModel (model: Doc[]) {
    for (const doc of model) {
      this.add(doc)
    }
  }

  // Q U E R Y

  findSync (clazz: Ref<Class<Doc>>, query: AnyLayout): Doc[] {
    const byClass = this.objectsOfClass(clazz)
    return this.findAll(byClass, clazz, query)
  }

  async find<T extends Doc> (clazz: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.findSync(clazz, query) as T[]
    // const byClass = this.objectsOfClass(clazz)
    // return this.findAll(byClass, clazz, query)
  }

  async findOne (clazz: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
    const result = await this.find(clazz, query)
    return result.length === 0 ? undefined : result[0]
  }

  protected findAll (docs: Doc[], _class: Ref<Class<Doc>>, query: AnyLayout): Doc[] {
    let result = docs
    const clazz = this.get(_class) as Classifier<Obj>

    for (const key in query) {
      const condition = query[key]
      const aKey = this.attributeKey(clazz, key)
      result = filterEq(result, aKey, condition)
    }

    return result === docs ? docs.concat() : result
  }

  tx (): Promise<void> {
    throw new Error('memdb is read only')
  }

  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    return {
      subscribe: (cb: (result: T[]) => void) => {
        this.find(_class, query).then(result => { cb(result) })
        return () => { }
      }
    }
  }

}

function filterEq (docs: Doc[], propertyKey: string, value: PropertyType): Doc[] {
  const result: Doc[] = []
  for (const doc of docs) {
    if (value === (doc as any)[propertyKey]) {
      result.push(doc)
    }
  }
  return result
}
