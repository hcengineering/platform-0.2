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

import { generateId } from '@anticrm/core/src/objectid'
import core, {
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
  ArrayOf,
  TxContext,
  StringProperty,
  PropertyType
} from '@anticrm/model'

export function mixinKey (mixin: Ref<Mixin<Doc>>, key: string): string {
  return key + '|' + mixin.replace('.', '~')
}

console.log(core)

export const MODEL_DOMAIN = 'model'

interface Proxy {
  __layout: Record<string, unknown>
}

export interface FieldRef {
  parent: Obj
  field: Attribute
  key: string
}

export interface MatchResult {
  // Define true if result is found
  result: boolean
  // Define a match value and operations.
  match?: Obj
  parentRef?: FieldRef
}

function isValidQuery (query: AnyLayout | null): boolean {
  return query !== null && Object.keys(query).length > 0
}

/**
 * Model is a storage for Class descriptors and useful functions to match class instances to queries and apply values to them based on changes.
 */
export class Model implements Storage {
  private readonly domain: string
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

  add (doc: Doc): void {
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

  getPrimaryKey (_class: Ref<Class<Obj>>): string | null {
    const primaryKey = mixinKey(core.mixin.Indices, 'primary')
    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      const clazz = this.get(cls) as Classifier<Doc>
      const primary = (clazz as any)[primaryKey]
      if (primary) {
        return primary
      }
      cls = clazz._extends
    }
    return null
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

  /**
   * Construct a new proper document with all desired fields.
   * @param _class
   * @param _id
   * @param layout
   */
  public newDoc<T extends Doc> (_class: Ref<Class<T>>, _id: Ref<Doc>, layout: AnyLayout): T {
    const doc = (this.assign({}, _class, layout) as unknown) as T
    doc._id = _id
    return doc
  }

  public classAttribute (cls: Ref<Class<Obj>>, key: string): { attr: Attribute, clazz: Class<Obj>, key: string } {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class) {
      const clazz = this.get(_class) as Class<Obj>
      const attr = (clazz._attributes as any)[key]
      if (attr !== undefined) {
        const attrKey = this.attributeKey(clazz, key)
        return {
          attr,
          clazz,
          key: attrKey
        }
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
  assign (layout: AnyLayout, _class: Ref<Class<Obj>>, values: AnyLayout): AnyLayout {
    const l = (layout as unknown) as AnyLayout
    const r = (values as unknown) as AnyLayout
    for (const rKey in values) {
      if (rKey.startsWith('_')) {
        l[rKey] = r[rKey]
      } else {
        const {
          attr,
          key
        } = this.classAttribute(_class, rKey)
        // Check if we need to perform inner assign based on field value and type
        switch (attr.type._class) {
          case core.class.ArrayOf: {
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
          case core.class.InstanceOf: {
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
    // Also assign a class to value if not specified
    if (!layout._class) {
      layout._class = _class
    }
    return layout
  }

  /**
   * Perform update of document attributes
   * @param doc - document to update
   * @param query - define a embedded document query.
   * @param attributes - new attribute values
   */
  public updateDocument<T extends Doc> (doc: T, query: AnyLayout | null, attributes: AnyLayout): T {
    if (isValidQuery(query)) {
      // We need to find embedded object first
      const result = this.matchObject(doc._class, doc, query, false)
      if (result.result && result.match) {
        this.assign((result.match as unknown) as AnyLayout, result.match._class, attributes)
        return doc
      }
      throw new Error('failed to match embedded object by query:' + query)
    }
    this.assign((doc as unknown) as AnyLayout, doc._class, attributes)
    return doc
  }

  /**
   * Perform push operation on document and put new embedded object into document.
   * @param doc - document to update
   * @param attribute - attribute holding embedded, it could be InstanceOf or ArrayOf
   * @param embedded - embedded object value
   */
  public pushDocument<T extends Doc> (doc: T, query: AnyLayout | null, attribute: StringProperty, embedded: AnyLayout): T {
    let queryObject: Obj = doc
    if (isValidQuery(query)) {
      const result = this.matchObject(doc._class, doc, query, false)
      if (result.result && result.match) {
        queryObject = result.match
      } else {
        throw new Error('failed to match embedded object by query:' + query)
      }
    }

    const {
      attr,
      key
    } = this.classAttribute(queryObject._class, attribute)

    const l = (queryObject as unknown) as AnyLayout
    switch (attr.type._class) {
      case core.class.ArrayOf: {
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

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): M {
    const layout = {
      _class,
      _id: _id ?? this.generateId()
    }
    this.assign(layout, _class, (values as unknown) as AnyLayout)
    // this.add(layout)
    return (layout as unknown) as M
  }

  public mixinDocument<E extends Doc, T extends E> (doc: E, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    if (!doc._mixins) {
      doc._mixins = []
    }
    if (doc._mixins.indexOf(clazz) === -1) {
      doc._mixins.push(clazz)
    }
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

  async findOne<T extends Doc> (clazz: Ref<Class<Doc>>, query: AnyLayout): Promise<T | undefined> {
    const result = await this.findSync(clazz, query, 1)
    return result.length === 0 ? undefined : result[0] as T
  }

  /**
   * Find all document matching query
   * @param docs - document to find in
   * @param _class - to match against
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

  // M I X I N S
  private prototypes = new Map<Ref<Classifier<Obj>>, Record<string, unknown>>()

  private createPrototype (classifier: Classifier<Obj>): Record<string, unknown> {
    const attributes = classifier._attributes as { [key: string]: Attribute }
    const descriptors = {} as PropertyDescriptorMap
    for (const key in attributes) {
      const attributeKey = this.attributeKey(classifier, key)
      descriptors[key] = {
        get (this: Proxy) {
          return this.__layout[attributeKey]
        }
      }
    }

    const proto = Object.create(classifier._extends ? this.getPrototype(classifier._extends) : Object.prototype)
    return Object.defineProperties(proto, descriptors)
  }

  private getPrototype (mixin: Ref<Classifier<Obj>>): Record<string, unknown> {
    const proto = this.prototypes.get(mixin)
    if (!proto) {
      const proto = this.createPrototype(this.get(mixin) as Classifier<Doc>)
      this.prototypes.set(mixin, proto)
      return proto
    }
    return proto
  }

  public as<T extends Doc> (doc: Doc, mixin: Ref<Mixin<T>>): T {
    const proxy = Object.create(this.getPrototype(mixin)) as Proxy & T
    proxy.__layout = (doc as unknown) as Record<string, unknown>
    return proxy
  }

  public cast<T extends Doc> (docs: Doc[], mixin: Ref<Mixin<T>>): T[] {
    return docs.map(doc => this.as(doc, mixin))
  }

  public isMixedIn (obj: Doc, _class: Ref<Mixin<Doc>>): boolean {
    return obj._mixins ? obj._mixins.includes(_class) : false
  }

  // S T O R A G E

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    this.add(doc)
    return Promise.resolve()
  }

  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void> { // eslint-disable-line
    const mdlObj = this.get(_id)
    if (!mdlObj) {
      return Promise.reject(new Error('No object found ' + (_id as string)))
    }
    this.pushDocument(mdlObj, query, attribute, attributes)
    return Promise.resolve()
  }

  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attributes: AnyLayout): Promise<void> { // eslint-disable-line
    const mdlObj = this.get(_id)
    if (!mdlObj) {
      return Promise.reject(new Error('No object found ' + (_id as string)))
    }
    this.updateDocument(mdlObj, query, attributes)
    return Promise.resolve()
  }

  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null): Promise<void> { // eslint-disable-line
    const mdlObj = this.get(_id)
    if (!mdlObj) {
      return Promise.reject(new Error('No object found ' + (_id as string)))
    }
    this.removeDocument(mdlObj, query)
    return Promise.resolve()
  }

  public removeDocument<T extends Doc> (doc: T, query: AnyLayout | null): T {
    if (isValidQuery(query)) {
      // This is operation against some embedded field.
      const result = this.matchObject(doc._class, doc, query, false)
      if (result.result && result.match && result.parentRef != null) {
        // this is pull operation, so let's find item and remove it from array.
        const parentObj = (result.parentRef.parent as unknown) as AnyLayout

        switch (result.parentRef.field.type._class) {
          case core.class.ArrayOf: {
            const parentArray = (parentObj[result.parentRef.key] as unknown) as Obj[]
            // We assume it will be found.
            parentArray.splice(parentArray.indexOf(result.match), 1)
            break
          }
          case core.class.InstanceOf: {
            delete (parentObj as any)[result.parentRef.key]
            break
          }
        }
      }
      return doc
    }

    this.objects.delete(doc._id)
    if (this.byClass) {
      const objs = this.byClass.get(doc._class)?.filter((e) => e._id !== doc._id)
      if (objs) {
        this.byClass.set(doc._class, objs)
      } else {
        // No items of class, so lets' remove it
        this.byClass.delete(doc._class)
      }
    }
    return doc
  }

  // Q U E R Y  P R O C E S S I N G
  /**
   * Matches query with document
   * @param _class Accept documents with this only specific _class
   * @param doc  document to match against.
   * @param query query to check.
   */
  matchQuery (_class: Ref<Class<Doc>>, doc: Doc, query: AnyLayout): boolean {
    if (_class !== doc._class) {
      // Class doesn't match so return false.
      return false
    }
    return this.matchObject(_class, doc, query, false).result
  }

  /**
   * Perform matching of document with query.
   * {fullMatch} is used as true to match against array with passing objects, it will match for all values.
   * If used as false, it will find at least one match for object with array value.
   */
  private matchObject (_class: Ref<Class<Doc>>, doc: Obj, query: AnyLayout | null, fullMatch = true): MatchResult {
    const queryEntries = Object.entries(query || {})
    const docKeys = new Set(Object.keys(doc))
    let count = 0
    const clazz = this.get(_class) as Classifier<Obj>

    let match: MatchResult = { // Assume initial match is document itself
      result: false,
      match: doc
    }
    const l = (doc as unknown) as AnyLayout
    for (const [key, value] of queryEntries) {
      if (value === undefined) {
        // Skip undefined as matched.
        count += 1
      }
      const attrKey = this.attributeKey(clazz, key)

      const keyIn = docKeys.has(attrKey)
      if (keyIn) {
        const docValue = l[attrKey]

        const attr = this.classAttribute(_class, key)
        if (attr.attr !== undefined) {
          const mResult = this.matchValue({
            parent: doc,
            field: attr.attr,
            key: attr.key
          } as FieldRef, docValue, value, fullMatch)
          if (mResult.result) {
            if (mResult.match) {
              match = mResult
            }
            count += 1
          }
        }
      }
    }
    if (count !== queryEntries.length) {
      return { result: false }
    }
    return {
      result: true,
      match: match.match,
      parentRef: match.parentRef
    }
  }

  private attributeClass (type: Type): Ref<Class<Doc>> | null {
    switch (type._class) {
      case core.class.ArrayOf:
        return this.attributeClass((type as ArrayOf).of)
      case core.class.InstanceOf:
        return ((type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
    }
    return null
  }

  private matchValue (parentRef: FieldRef, docValue: unknown, value: unknown, fullMatch: boolean): MatchResult {
    const objDocValue = Object(docValue)
    if (objDocValue !== docValue) {
      // Check if value is primitive, so we will just compare
      if (docValue === value) {
        return { result: true }
      }
    } else {
      // We got two arrays, so let's compare them
      if (docValue instanceof Array && value instanceof Array) {
        if (docValue.length !== value.length && fullMatch) {
          return { result: false }
        }
        let match: Obj | undefined
        for (let i = 0; i < docValue.length; i++) {
          const val = this.matchValue(parentRef, docValue[i], value[i], fullMatch)
          if (!val.result && fullMatch) {
            return { result: false }
          }
          match = val.match
        }
        // Return in case match is found
        return {
          result: true,
          match,
          parentRef: parentRef
        }
      }

      // We had object, we need to compare inner object, but we need a class
      if (docValue instanceof Array) {
        // Match to find exact value present in array
        for (let i = 0; i < docValue.length; i++) {
          const val = this.matchValue(parentRef, docValue[i], value, fullMatch)
          if (val.result) {
            return {
              result: true,
              match: val.match,
              parentRef: parentRef
            }
          }
        }
      } else {
        const fieldClass = this.attributeClass(parentRef.field.type)
        if (fieldClass != null) {
          const objResult = this.matchObject(fieldClass, docValue as Obj, (value as unknown) as AnyLayout)
          if (objResult.result) {
            if (!objResult.parentRef) {
              objResult.parentRef = parentRef
            }
            return objResult
          }
        }
      }
    }
    return { result: false }
  }
}
