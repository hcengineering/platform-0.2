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
import {
  AnyLayout,
  Class,
  Classifier,
  ClassifierKind,
  Doc,
  Mixin,
  Type,
  Obj,
  Ref,
  Storage,
  Attribute,
  CORE_CLASS_ARRAY,
  CORE_CLASS_INSTANCE,
  InstanceOf,
  ArrayOf
} from './core'

export function mixinKey(mixin: Ref<Mixin<Doc>>, key: string): string {
  return key + '|' + mixin.replace('.', '~')
}

export const MODEL_DOMAIN = 'model'

export class Model implements Storage {
  private domain: string
  private objects = new Map<Ref<Doc>, Doc>()
  private byClass: Map<Ref<Class<Doc>>, Doc[]> | null = null

  constructor(domain: string) {
    this.domain = domain
  }

  protected objectsOfClass(_class: Ref<Class<Doc>>): Doc[] {
    if (!this.byClass) {
      this.byClass = new Map<Ref<Class<Doc>>, Doc[]>()
      for (const doc of this.objects.values()) {
        this.index(doc)
      }
    }
    return this.byClass.get(_class) ?? []
  }

  protected attributeKey(clazz: Classifier<Obj>, key: string): string {
    return clazz._kind === ClassifierKind.MIXIN ? mixinKey(clazz._id as Ref<Mixin<Doc>>, key) : key
  }

  private set(doc: Doc) {
    const id = doc._id
    if (this.objects.get(id)) {
      throw new Error('document added already ' + id)
    }
    this.objects.set(id, doc)
  }

  private index(doc: Doc) {
    if (this.byClass === null) {
      throw new Error('index not created')
    }
    const byClass = this.byClass
    const hierarchy = this.getClassHierarchy(doc._class)
    hierarchy.forEach(_class => {
      const cls = _class as Ref<Class<Doc>>
      const list = byClass.get(cls)
      if (list) {
        list.push(doc)
      } else {
        byClass.set(cls, [doc])
      }
    })
  }

  add(doc: Doc) {
    this.set(doc)
    if (this.byClass) this.index(doc)
  }

  get(id: Ref<Doc>): Doc {
    const obj = this.objects.get(id)
    if (!obj) {
      throw new Error('document not found ' + id)
    }
    return obj
  }

  // U T I L I T Y

  private _getAllAttributes(attributes: [string, Attribute][], _class: Ref<Class<Obj>>) {
    const clazz = this.get(_class) as Class<Doc>
    attributes.push(...Object.entries(clazz._attributes))

    if (clazz._extends) {
      this._getAllAttributes(attributes, clazz._extends)
    }
  }

  getAllAttributes(_class: Ref<Class<Obj>>): [string, Attribute][] {
    const attributes: [string, Attribute][] = []
    this._getAllAttributes(attributes, _class)
    return attributes
  }

  // D O M A I N

  getDomain(id: Ref<Class<Doc>>): string {
    let clazz = this.objects.get(id) as Class<Doc> | undefined
    while (clazz) {
      if (clazz._domain) return clazz._domain as string
      clazz = clazz._extends ? (this.objects.get(clazz._extends) as Class<Doc>) : undefined
    }
    throw new Error('no domain found for class: ' + id)
  }

  getClass(_class: Ref<Class<Doc>>): Ref<Class<Doc>> {
    let cls = _class
    while (cls) {
      const clazz = this.get(cls) as Class<Doc>
      if (clazz._kind === ClassifierKind.CLASS) return cls
      cls = clazz._extends as Ref<Class<Doc>>
    }
    throw new Error('class not found in hierarchy: ' + _class)
  }

  /// A S S I G N

  private findAttributeKey<T extends Doc>(cls: Ref<Class<Obj>>, key: string): string {
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
  assign(layout: AnyLayout, _class: Ref<Classifier<Doc>>, values: AnyLayout): AnyLayout {
    const l = (layout as unknown) as AnyLayout
    const r = (values as unknown) as AnyLayout
    for (const key in values) {
      if (key.startsWith('_')) {
        l[key] = r[key]
      } else {
        l[this.findAttributeKey(_class, key)] = r[key]
      }
    }
    return layout
  }

  generateId(): Ref<Doc> {
    return generateId() as Ref<Doc>
  }

  createDocument<M extends Doc>(_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): Doc {
    const layout = { _class, _id: _id ?? this.generateId() }
    this.assign(layout, _class, (values as unknown) as AnyLayout)
    // this.add(layout)
    return layout
  }

  mixinDocument<T extends E, E extends Doc>(doc: E, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    if (!doc._mixins) {
      doc._mixins = []
    }
    doc._mixins.push(clazz)
    this.assign((doc as unknown) as AnyLayout, clazz as Ref<Classifier<Doc>>, (values as unknown) as AnyLayout)
  }

  mixin<T extends E, E extends Doc>(id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    this.mixinDocument(this.get(id) as E, clazz, values)
  }

  getClassHierarchy(cls: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Ref<Class<Obj>>[] {
    const result = [] as Ref<Class<Obj>>[]
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class && _class !== top) {
      result.push(_class)
      _class = (this.get(_class) as Class<Obj>)._extends
    }
    return result
  }

  is(_class: Ref<Class<Obj>>, a: Ref<Class<Obj>>): boolean {
    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      if (cls === a) {
        return true
      }
      cls = (this.get(cls) as Class<Obj>)._extends
    }
    return false
  }

  dump(): Doc[] {
    const result = []
    for (const doc of this.objects.values()) {
      result.push(doc)
    }
    return result
  }

  async loadDomain(domain: string): Promise<Doc[]> {
    if (this.domain !== domain) {
      throw new Error('domain does not match')
    }
    return this.dump()
  }

  loadModel(model: Doc[]): void {
    for (const doc of model) {
      this.add(doc)
    }
  }

  // Q U E R Y

  findSync(clazz: Ref<Class<Doc>>, query: AnyLayout): Doc[] {
    const byClass = this.objectsOfClass(clazz)
    return this.findAll(byClass, clazz, query)
  }

  async find<T extends Doc>(clazz: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.findSync(clazz, query) as T[]
    // const byClass = this.objectsOfClass(clazz)
    // return this.findAll(byClass, clazz, query)
  }

  async findOne(clazz: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
    const result = await this.find(clazz, query)
    return result.length === 0 ? undefined : result[0]
  }

  protected findAll(docs: Doc[], _class: Ref<Class<Doc>>, query: AnyLayout): Doc[] {
    const result: Doc[] = []
    for (const doc of docs) {
      if (this.matchQuery(_class, doc, query)) {
        result.push(doc)
      }
    }
    return result === docs ? docs.concat() : result
  }

  // S T O R A G E

  async store(doc: Doc): Promise<void> {
    this.add(doc)
  }

  push(_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    throw new Error('Method not implemented. model push')
  }
  update(_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void> {
    throw new Error('Method not implemented. model update')
  }
  remove(_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    throw new Error('Method not implemented. model remove')
  }

  // Q U E R Y  P R O C E S S I N G
  /**
   * Matches query with document
   * @param _class Accept documents with this only specific _class
   * @param doc  document to match agains.
   * @param query query to check.
   */
  matchQuery(_class: Ref<Class<Doc>>, doc: Doc, query: AnyLayout): boolean {
    if (_class !== doc._class) {
      // Class doesn't match so return false.
      return false
    }
    return this.matchObject(_class, (doc as unknown) as Record<string, unknown>, query)
  }

  /**
   *
   * @param doc
   * @param query
   */
  matchObject(_class: Ref<Class<Obj>>, doc: Record<string, unknown>, query: AnyLayout): boolean {
    const ents = Object.entries(query)
    const docKeys = new Set(Object.keys(doc))
    let count = 0
    const clazz = this.get(_class) as Classifier<Obj>
    for (const [key, value] of ents) {
      const attrKey = this.attributeKey(clazz, key)

      const keyIn = docKeys.has(attrKey)
      if (keyIn) {
        const docValue = doc[attrKey]

        const attrClass = this.classAttribute(_class, key)
        if (attrClass !== undefined) {
          if (this.matchValue(this.attributeClass(attrClass.type), docValue, value)) {
            count += 1
          }
        }
      }
    }
    if (count !== ents.length) {
      return false
    }
    return true
  }

  private attributeClass(type: Type): Ref<Class<Doc>> | null {
    switch (type._class) {
      case CORE_CLASS_ARRAY:
        return this.attributeClass((type as ArrayOf).of)
      case CORE_CLASS_INSTANCE:
        return ((type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
    }
    return null
  }

  private classAttribute(cls: Ref<Class<Obj>>, key: string): Attribute {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      const clazz = this.get(_class) as Class<Obj>
      const attr = (clazz._attributes as any)[key]
      if (attr !== undefined) {
        return attr
      }
      _class = clazz._extends
    }
    throw new Error('attribute not found: ' + key)
  }

  matchValue(fieldClass: Ref<Class<Doc>> | null, docValue: unknown, value: unknown): boolean {
    const objDocValue = Object(docValue)
    if (objDocValue !== docValue) {
      // Check if value is primitive, so we will just compare
      if (docValue === value) {
        return true
      }
    } else {
      // We got two arrays, so let's compare them
      if (docValue instanceof Array && value instanceof Array) {
        if (docValue.length !== value.length) {
          return false
        }
        for (let i = 0; i < docValue.length; i++) {
          if (!this.matchValue(fieldClass, docValue[i], value[i])) {
            return false
          }
        }
        return true
      }

      // We had object, we need to compare inner object, but we need a class
      // TODO: Add a class to match embedded object
      if (fieldClass != null && this.matchObject(fieldClass, (docValue as unknown) as Record<string, unknown>, (value as unknown) as AnyLayout)) {
        return true
      }
    }
    return false
  }
}
