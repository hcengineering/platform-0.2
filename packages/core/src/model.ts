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
  ArrayOf,
  TxContext,
  StringProperty,
  PropertyType,
  Emb
} from './core'

export function mixinKey (mixin: Ref<Mixin<Doc>>, key: string): string {
  return key + '|' + mixin.replace('.', '~')
}

export const MODEL_DOMAIN = 'model'

/**
 * Model is a storage for Class descriptors and usefull functions to match class instances to queries and apply values to them based on changes.
 */
export class Model implements Storage {
  private domain: string
  private objects = new Map<Ref<Doc>, Doc>()
  private byClass: Map<Ref<Class<Doc>>, Doc[]> | null = null

  constructor (domain: string) {
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
    return clazz._kind === ClassifierKind.MIXIN ? mixinKey(clazz._id as Ref<Mixin<Doc>>, key) : key
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

  // U T I L I T Y

  private _getAllAttributes (attributes: [string, Attribute][], _class: Ref<Class<Obj>>) {
    const clazz = this.get(_class) as Class<Doc>
    attributes.push(...Object.entries(clazz._attributes))

    if (clazz._extends) {
      this._getAllAttributes(attributes, clazz._extends)
    }
  }

  getAllAttributes (_class: Ref<Class<Obj>>): [string, Attribute][] {
    const attributes: [string, Attribute][] = []
    this._getAllAttributes(attributes, _class)
    return attributes
  }

  // D O M A I N

  getDomain (id: Ref<Class<Doc>>): string {
    let clazz = this.objects.get(id) as Class<Doc> | undefined
    while (clazz) {
      if (clazz._domain) return clazz._domain as string
      clazz = clazz._extends ? (this.objects.get(clazz._extends) as Class<Doc>) : undefined
    }
    throw new Error('no domain found for class: ' + id)
  }

  getClass (_class: Ref<Class<Doc>>): Ref<Class<Doc>> {
    let cls = _class
    while (cls) {
      const clazz = this.get(cls) as Class<Doc>
      if (clazz._kind === ClassifierKind.CLASS) return cls
      cls = clazz._extends as Ref<Class<Doc>>
    }
    throw new Error('class not found in hierarchy: ' + _class)
  }

  /// A S S I G N

  private classAttribute (cls: Ref<Class<Obj>>, key: string): { attr: Attribute, clazz: Class<Obj>, key: string } {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      const clazz = this.get(_class) as Class<Obj>
      const attr = (clazz._attributes as any)[key]
      if (attr !== undefined) {
        const attrKey = this.attributeKey(clazz, key)
        return { attr, clazz, key: attrKey }
      }
      _class = clazz._extends
    }
    throw new Error('attribute not found: ' + key)
  }

  pushArrayValue (curValue: unknown, attrClass: Ref<Class<Doc>>, embedded: AnyLayout): Array<PropertyType> {
    // Assign into  a proper classed values.
    const objValue = this.assign({}, attrClass, embedded)
    objValue._class = attrClass
    // Take current array and push value into it.
    if (curValue === null || curValue === undefined) {
      // Just assign a new Array
      return [objValue]
    } else if (curValue instanceof Array) {
      const curArray = curValue as Array<PropertyType>
      curArray.push(objValue)
      return curArray
    } else {
      throw new Error('Invalid attribute type: ' + curValue)
    }
  }

  // from Builder
  assign (layout: AnyLayout, _class: Ref<Class<Doc>>, values: AnyLayout): AnyLayout {
    const l = (layout as unknown) as AnyLayout
    const r = (values as unknown) as AnyLayout
    for (const rKey in values) {
      if (rKey.startsWith('_')) {
        l[rKey] = r[rKey]
      } else {
        const { attr, key } = this.classAttribute(_class, rKey)
        // Check if we need to perform inner assign based on field value and type
        switch (attr.type._class) {
          case CORE_CLASS_ARRAY: {
            const attrClass = this.attributeClass((attr.type as ArrayOf).of)
            if (attrClass) {
              const lValue = r[rKey]
              if (lValue instanceof Array) {
                let value: unknown[] = []
                for (const lv of (lValue as Array<unknown>)) {
                  value = this.pushArrayValue(value, attrClass, lv as AnyLayout)
                }
                l[key] = (value as unknown) as AnyLayout
                continue
              }
            }
            break
          }
          case CORE_CLASS_INSTANCE: {
            const attrClass = ((attr.type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
            if (attrClass) {
              l[key] = this.assign({}, attrClass, r[rKey] as AnyLayout)
              continue
            }
            break
          }
        }
        l[key] = r[rKey]
      }
    }
    return layout
  }

  /**
   * Perform update of document attributes
   * @param doc - document to update
   * @param attributes - new attribute values
   */
  public updateDocument (doc: Doc, attributes: AnyLayout): Doc {
    this.assign((doc as unknown) as AnyLayout, doc._class, attributes)
    return doc
  }

  /**
   * Perform push operation on document and put new embedded object into document.
   * @param doc - document to update
   * @param attribute - attribute holding embedded, it could be InstanceoOf or ArrayOf
   * @param embedded - embedded object value
   */
  public pushDocument (doc: Doc, attribute: StringProperty, embedded: AnyLayout): Doc {
    const { attr, key } = this.classAttribute(doc._class, attribute)
    const l = (doc as unknown) as AnyLayout

    switch (attr.type._class) {
      case CORE_CLASS_ARRAY: {
        const attrClass = this.attributeClass((attr.type as ArrayOf).of)
        if (attrClass === null) {
          throw new Error('Invalid attribute type/class: ' + attr.type)
        }
        l[key] = this.pushArrayValue(l[key], attrClass, embedded)
        return doc
      }

      default:
        throw new Error('Invalid attribute type: ' + attr.type)
    }
  }

  generateId (): Ref<Doc> {
    return generateId() as Ref<Doc>
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): Doc {
    const layout = { _class, _id: _id ?? this.generateId() }
    this.assign(layout, _class, (values as unknown) as AnyLayout)
    // this.add(layout)
    return layout
  }

  mixinDocument<E extends Doc, T extends E> (doc: E, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    if (!doc._mixins) {
      doc._mixins = []
    }
    doc._mixins.push(clazz)
    this.assign((doc as unknown) as AnyLayout, clazz as Ref<Classifier<Doc>>, (values as unknown) as AnyLayout)
  }

  mixin<E extends Doc, T extends E> (id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
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

  loadModel (model: Doc[]): void {
    for (const doc of model) {
      this.add(doc)
    }
  }

  // Q U E R Y

  findSync (clazz: Ref<Class<Doc>>, query: AnyLayout, limit = -1): Doc[] {
    const byClass = this.objectsOfClass(clazz)

    return this.findAll(byClass, clazz, query, limit)
  }

  async find<T extends Doc> (clazz: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.findSync(clazz, query) as T[]
  }

  async findOne (clazz: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
    const result = await this.findSync(clazz, query, 1)
    return result.length === 0 ? undefined : result[0]
  }

  /**
   * Find all document macthing query
   * @param docs - document to find in
   * @param _class - to match agains
   * @param query  - to match
   * @param limit - a number of items to find, pass value <= 0 to find all
   */
  protected findAll (docs: Doc[], _class: Ref<Class<Doc>>, query: AnyLayout, limit = -1): Doc[] {
    const result: Doc[] = []
    for (const doc of docs) {
      if (this.matchQuery(_class, doc, query)) {
        result.push(doc)
        if (limit > 0 && result.length > limit) {
          return result
        }
      }
    }
    return (result.length === docs.length) ? docs.concat() : result
  }

  // S T O R A G E

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    this.add(doc)
  }

  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: StringProperty, attributes: AnyLayout): Promise<void> { // eslint-disable-line
    throw new Error('Method not implemented. model push')
  }

  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: AnyLayout): Promise<void> { // eslint-disable-line
    throw new Error('Method not implemented. model update')
  }

  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> { // eslint-disable-line
    throw new Error('Method not implemented. model remove')
  }

  // Q U E R Y  P R O C E S S I N G
  /**
   * Matches query with document
   * @param _class Accept documents with this only specific _class
   * @param doc  document to match agains.
   * @param query query to check.
   */
  matchQuery (_class: Ref<Class<Doc>>, doc: Doc, query: AnyLayout): boolean {
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
  private matchObject (_class: Ref<Class<Obj>>, doc: Record<string, unknown>, query: AnyLayout): boolean {
    const ents = Object.entries(query)
    const docKeys = new Set(Object.keys(doc))
    let count = 0
    const clazz = this.get(_class) as Classifier<Obj>
    for (const [key, value] of ents) {
      const attrKey = this.attributeKey(clazz, key)

      const keyIn = docKeys.has(attrKey)
      if (keyIn) {
        const docValue = doc[attrKey]

        const { attr } = this.classAttribute(_class, key)
        if (attr !== undefined) {
          if (this.matchValue(this.attributeClass(attr.type), docValue, value)) {
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

  private attributeClass (type: Type): Ref<Class<Doc>> | null {
    switch (type._class) {
      case CORE_CLASS_ARRAY:
        return this.attributeClass((type as ArrayOf).of)
      case CORE_CLASS_INSTANCE:
        return ((type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
    }
    return null
  }

  private matchValue (fieldClass: Ref<Class<Doc>> | null, docValue: unknown, value: unknown): boolean {
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
