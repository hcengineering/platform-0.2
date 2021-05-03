//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { CORE_CLASS_OBJECT_SELECTOR, CORE_CLASS_TX_OPERATION, ObjectSelector, TxOperation, TxOperationKind } from '@anticrm/domains'
import {
  AnyLayout, ArrayOf, Attribute, Class, Classifier, ClassifierKind, CORE_CLASS_ARRAY_OF, CORE_CLASS_CLASS,
  CORE_CLASS_INSTANCE_OF,
  CORE_CLASS_MIXIN,
  CORE_CLASS_OBJ, CORE_MIXIN_INDICES, Doc, Mixin, Obj, Property, PropertyType, Ref, Type
} from './classes'
import { DocumentQuery, DocumentSorting, DocumentValue, FindOptions, generateId, RegExpression, Storage, TxContext } from './storage'

export function mixinKey (mixin: Ref<Mixin<Obj>>, key: string): string {
  return key + '|' + mixin.replace('.', '~')
}

export function mixinFromKey (key: string): { mixin: Ref<Mixin<Obj>>, key: string } {
  const pos = key.indexOf('|')
  return {
    mixin: key.substring(pos + 1).replace('~', '.') as Ref<Mixin<Doc>>,
    key: key.substring(0, pos)
  }
}

export const MODEL_DOMAIN = 'model'
export const SPACE_DOMAIN = 'space'

interface Proxy {
  __layout: Record<string, unknown>
}

export function isValidSelector (selector: ObjectSelector[]): boolean {
  return selector.length > 0
}

export interface AttributeMatch {
  name: string
  attr: Attribute
  clazz: Class<Obj>
  key: string
}

/**
 * Model is a storage for Class descriptors and useful functions to match class instances to queries and apply values to them based on changes.
 */
export class Model implements Storage {
  private readonly domain: string
  private readonly objects = new Map<Ref<Doc>, Doc>()

  private byClass: Map<Ref<Class<Doc>>, Doc[]> | undefined = undefined
  private byExtends: Map<Ref<Class<Obj>>, Array<Class<Obj>>> | undefined = undefined

  constructor (domain: string) {
    this.domain = domain
  }

  protected objectsOfClass (_class: Ref<Class<Doc>>): Doc[] {
    if (this.byClass === undefined) {
      this.byClass = new Map<Ref<Class<Doc>>, Doc[]>()
      for (const doc of this.objects.values()) {
        this.indexInstances(doc)
      }
    }
    return this.byClass.get(_class) ?? []
  }

  protected extendsOfClass (_class: Ref<Class<Obj>>): Array<Class<Obj>> {
    if (this.byExtends === undefined) {
      this.byExtends = new Map<Ref<Class<Obj>>, Array<Class<Obj>>>()
      for (const doc of this.objects.values()) {
        this.indexExtends(doc)
      }
    }
    return this.byExtends.get(_class) ?? []
  }

  attributeKey (clazz: Classifier, key: string): string {
    return clazz._kind === ClassifierKind.MIXIN ? mixinKey(clazz._id as Ref<Mixin<Doc>>, key) : key
  }

  private set (doc: Doc): void {
    const id = doc._id
    if (this.objects.get(id) !== undefined) {
      throw new Error('document added already ' + id)
    }
    this.objects.set(id, doc)
  }

  private unset (id: Ref<Doc>): Doc {
    const result = this.objects.get(id)
    if (result === undefined) {
      throw new Error('document is not found ' + id)
    }
    this.objects.delete(id)
    return result
  }

  private indexInstances (doc: Doc, add = true): void {
    if (this.byClass === undefined) {
      throw new Error('indexInstances not created')
    }
    const byClass = this.byClass
    const hierarchy = this.getClassHierarchy(doc._class)

    for (const _class of hierarchy) {
      const cls = _class as Ref<Class<Doc>>
      const list = byClass.get(cls)
      if (list !== undefined) {
        if (add) {
          list.push(doc)
        } else {
          // Replace without our document
          byClass.set(cls, list.filter((dd) => dd._id !== doc._id))
        }
      } else {
        byClass.set(cls, [doc])
      }
    }
  }

  private indexExtends (doc: Doc, add = true): void {
    if (this.byExtends === undefined) {
      throw new Error('indexInstances not created')
    }
    const byExtends = this.byExtends
    if (this.is(doc._class, CORE_CLASS_CLASS)) {
      //  This is class, let's also check its' hierarchy
      const hierarchy = this.getClassHierarchy(doc._id as Ref<Class<Obj>>)
      for (const cls of hierarchy) {
        const list = byExtends.get(cls)
        if (list !== undefined) {
          if (add) {
            list.push(doc as Class<Obj>)
          } else {
            // Replace without our document
            byExtends.set(cls, list.filter((dd) => dd._id !== doc._id))
          }
        } else {
          byExtends.set(cls, [doc as Class<Obj>])
        }
      }
    }
  }

  add (doc: Doc): void {
    this.set(doc)
    if (this.byClass !== undefined) this.indexInstances(doc)
    if (this.byExtends !== undefined) this.indexExtends(doc)
  }

  del (id: Ref<Doc>): void {
    const doc = this.unset(id)
    if (this.byClass !== undefined) this.indexInstances(doc, false)
    if (this.byExtends !== undefined) this.indexExtends(doc, false)
  }

  get<T extends Doc> (id: Ref<T>): T {
    const obj = this.objects.get(id)
    if (obj === undefined) {
      throw new Error('document not found ' + id)
    }
    return obj as T
  }

  // U T I L I T Y

  private _getAllAttributes (attributes: AttributeMatch[], _class: Ref<Class<Obj>>): void {
    const clazz = this.get(_class) as Class<Doc>
    for (const kv of Object.entries(clazz._attributes)) {
      attributes.push({ name: kv[0], attr: kv[1], clazz, key: this.attributeKey(clazz, kv[0]) })
    }

    if (clazz._extends !== undefined) {
      this._getAllAttributes(attributes, clazz._extends)
    }
  }

  getAllAttributes (_class: Ref<Class<Obj>>): AttributeMatch[] {
    const attributes: AttributeMatch[] = []
    this._getAllAttributes(attributes, _class)
    return attributes
  }

  getPrimaryKey (_class: Ref<Class<Obj>>): string | undefined {
    const primaryKey = mixinKey(CORE_MIXIN_INDICES, 'primary')
    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls !== undefined) {
      const clazz = this.get(cls)
      const primary = (clazz as any)[primaryKey]
      if (primary !== undefined) {
        return primary
      }
      cls = clazz._extends
    }
    return undefined
  }

  // D O M A I N

  getDomain (id: Ref<Class<Doc>>): string {
    let clazz = this.objects.get(id) as Class<Doc> | undefined
    while (clazz !== undefined) {
      if (clazz._domain !== undefined) return clazz._domain as string
      clazz = (clazz._extends !== undefined) ? (this.objects.get(clazz._extends) as Class<Doc>) : undefined
    }
    throw new Error('no domain found for class: ' + id)
  }

  getClass (_class: Ref<Class<Obj>>): Ref<Class<Obj>> {
    let cls = _class
    while (cls !== undefined) {
      const clazz = this.get(cls)
      if (clazz._kind === ClassifierKind.CLASS) return cls
      cls = clazz._extends as Ref<Class<Obj>>
    }
    throw new Error('class not found in hierarchy: ' + _class)
  }

  /// A S S I G N

  /**
   * Construct a new proper document with all desired fields.
   * @param _class
   * @param values
   * @param _id - optional id, if not sepecified will be automatically generated.
   */
  createDocument<T extends Doc> (_class: Ref<Class<T>>, values: DocumentValue<T>, _id?: Ref<T>): T {
    const doc = this.assign({}, _class, (values as unknown) as AnyLayout)
    doc._id = _id ?? generateId()
    return (doc as unknown) as T
  }

  public classAttribute (cls: Ref<Class<Obj>>, key: string): AttributeMatch {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class !== undefined) {
      const clazz = this.get(_class)
      const attr = (clazz._attributes as any)[key]
      if (attr !== undefined) {
        const attrKey = this.attributeKey(clazz, key)
        return {
          name: key,
          attr,
          clazz,
          key: attrKey
        }
      }
      _class = clazz._extends
    }
    throw new Error(`attribute not found: ${key} in ${cls}`)
  }

  public pushArrayValue (curValue: unknown, attrClass: Ref<Class<Doc>>, embedded: AnyLayout): PropertyType[] {
    // Assign into  a proper classed values.
    const objValue = this.assign({}, attrClass, embedded)
    objValue._class = attrClass
    // Take current array and push value into it.
    if (curValue === null || curValue === undefined) {
      // Just assign a new Array
      return [objValue]
    } else if (curValue instanceof Array) {
      const curArray = curValue as PropertyType[]
      curArray.push(objValue)
      return curArray
    } else {
      throw new Error(`Invalid attribute type: ${String(curValue)}`)
    }
  }

  public flattenArrayValue (curValue: unknown, attrClass: Ref<Class<Doc>>, embedded: AnyLayout): PropertyType[] {
    // Assign into  a proper classed values.
    const objValue = this.flattenQuery(attrClass, embedded)
    objValue._class = attrClass
    // Take current array and push value into it.
    if (curValue === null || curValue === undefined) {
      // Just assign a new Array
      return [{ $elemMatch: objValue }]
    } else if (curValue instanceof Array) {
      const curArray = curValue as PropertyType[]
      curArray.push({ $elemMatch: objValue })
      return curArray
    } else {
      throw new Error(`Invalid attribute type: ${String(curValue)}`)
    }
  }

  getLayout (doc: Obj): AnyLayout {
    if ((doc as any).__layout !== undefined) {
      return ((doc as unknown as Proxy).__layout) as AnyLayout
    }
    return (doc as unknown) as AnyLayout
  }

  // from Builder
  assign (layout: AnyLayout, _class: Ref<Class<Obj>>, values: AnyLayout): AnyLayout {
    const l = layout
    const r = values

    // Also assign a class to value if not specified
    if (layout._class === undefined) {
      layout._class = this.getClass(_class) // Be sure we use class, not a mixin.
    }
    for (const rKey in values) {
      // TODO: Will be removed with fix to #398
      if (rKey.startsWith('_')) {
        if (rKey === '_class') {
          // Ignore _class, it is handled separatly
          continue
        }
        l[rKey] = r[rKey]
        continue
      }
      if (rKey.indexOf('|') > 0) {
        // So key is probable mixin, this is required to create objects with mixins defined already.
        const { mixin, key } = mixinFromKey(rKey)
        this.assign(layout, mixin, { [key]: r[rKey] })
      } else {
        const {
          attr,
          key
        } = this.classAttribute(_class, rKey)
        // Check if we need to perform inner assign based on field value and type
        switch (attr.type._class) {
          case CORE_CLASS_ARRAY_OF: {
            const attrClass = this.attributeClass((attr.type as ArrayOf).of)
            if (attrClass !== undefined) {
              const rValue = r[rKey]
              if (rValue instanceof Array) {
                let value: unknown[] = []
                for (const rv of (rValue as unknown[])) {
                  value = this.pushArrayValue(value, attrClass, rv as AnyLayout)
                }
                l[key] = (value as unknown) as AnyLayout
                continue
              }
            }
            break
          }
          case CORE_CLASS_INSTANCE_OF: {
            const attrClass = ((attr.type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
            if (attrClass !== undefined) {
              l[key] = this.assign({}, attrClass, r[rKey] as AnyLayout)
              continue
            }
            break
          }
        }
        l[key] = r[rKey]
      }
    }
    return l
  }

  /**
   * Perform update of document attributes
   * @param doc - document to update
   * @param operations - define a set of operations to update for document.
   */
  public updateDocument<T extends Obj> (doc: T, operations: TxOperation[]): T {
    for (const op of operations) {
      // We need to find embedded object first
      const match = this.matchSelector(doc._class, doc, op.selector)
      if (match.match) {
        switch (op.kind) {
          case TxOperationKind.Set:
            this.assign(this.getLayout(match.doc), match.doc._class, op._attributes)
            break
          case TxOperationKind.Push:
            if (match.attrMatch !== undefined) {
              const { attr, key } = match.attrMatch

              const l = (match.doc as unknown) as AnyLayout
              switch (attr.type._class) {
                case CORE_CLASS_ARRAY_OF: {
                  const attrClass = this.attributeClass((attr.type as ArrayOf).of)
                  if (attrClass === undefined) {
                    throw new Error(`Invalid attribute type/class: ${String(attr.type)}`)
                  }
                  l[key] = this.pushArrayValue(l[key], attrClass, op._attributes)
                  break
                }

                default:
                  throw new Error(`Invalid attribute type: ${String(attr.type)}`)
              }
            }
            break
          case TxOperationKind.Pull:
            if (match.attrMatch !== undefined) {
              const { attr, key } = match.attrMatch

              const l = (match.parent as unknown) as AnyLayout

              switch (attr.type._class) {
                case CORE_CLASS_ARRAY_OF: {
                  const parentArray = (l[key] as unknown) as Obj[]
                  // We assume it will be found.
                  parentArray.splice(parentArray.indexOf(match.value), 1)
                  break
                }
                case CORE_CLASS_INSTANCE_OF: {
                  delete (l as any)[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
                  break
                }
              }
            }
            break
        }
      } else {
        throw new Error(`failed to object by query:${String(op.selector)}`)
      }
    }
    return doc
  }

  public mixinDocument<E extends Obj, T extends Obj> (doc: E, clazz: Ref<Mixin<T>>, values: Partial<Omit<T, keyof E>>): void {
    Model.includeMixin(doc, clazz)
    this.assign(this.getLayout(doc), clazz as Ref<Class<Obj>>, (values as unknown) as AnyLayout)
  }

  public static includeMixin<E extends Obj, T extends Obj> (doc: E, clazz: Ref<Mixin<T>>): void {
    this.includeMixinAny(doc, clazz as Ref<Mixin<Obj>>)
  }

  private static includeMixinAny (doc: any, clazz: Ref<Mixin<Obj>>): void {
    if (doc._mixins === undefined) {
      doc._mixins = []
    }
    const mixins = (doc._mixins as Array<Ref<Mixin<Obj>>>)
    if (!mixins.includes(clazz)) {
      mixins.push(clazz)
    }
  }

  mixin<E extends Doc, T extends E> (id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
    this.mixinDocument(this.get(id), clazz, values)
  }

  getClassHierarchy (cls: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Array<Ref<Class<Obj>>> {
    const result: Array<Ref<Class<Obj>>> = []
    let _class = cls as Ref<Class<Obj>> | undefined
    while ((_class !== undefined) && _class !== top) {
      result.push(_class)
      _class = this.get(_class)._extends
    }
    return result
  }

  is (_class: Ref<Class<Obj>>, a: Ref<Class<Obj>>): boolean {
    let cls: Ref<Class<Obj>> | undefined = _class
    while (cls !== undefined) {
      if (cls === a) {
        return true
      }
      cls = this.get(cls)._extends
    }
    return false
  }

  dump (): Doc[] {
    const result: Doc[] = []
    for (const doc of this.objects.values()) {
      result.push(doc)
    }
    return result
  }

  async loadDomain (domain: string): Promise<Doc[]> {
    if (this.domain !== domain) {
      throw new Error('domain does not match')
    }
    return await Promise.resolve(this.dump())
  }

  loadModel (model: Doc[]): void {
    for (const doc of model) {
      this.add(doc)
    }
  }

  /**
   * Creates a query with filled class and mixin information properly set.
   **
   * @param _class - a class query is designed for.
   * @param _query - a query object to convert to.
   * @param flatten - use a flat key layout with dot notation.
   *
   * flatten queries are applicable only for mongoDB and not supported by model search operations.
   */
  createQuery<T extends Doc> (_class: Ref<Class<T>>, _query: DocumentQuery<T>, flatten = false): { query: DocumentQuery<T>, classes: Array<Ref<Class<Obj>>> } {
    let query = this.assign({}, _class, _query as AnyLayout)

    if (flatten) {
      query = this.flattenQuery(_class, query)
    }

    const cl = this.getClass(_class)
    query._class = cl
    const classes: Array<Ref<Class<Obj>>> = []

    const byClass = this.extendsOfClass(query._class as Ref<Class<Doc>>)
    const byClassNotMixin = byClass.filter((cl) => !this.is(cl._id as Ref<Class<Obj>>, CORE_CLASS_MIXIN)).map(p => p._id as Ref<Class<Obj>>)
    if (byClassNotMixin.length > 0) {
      // We need find for all classes extending our own.
      classes.push(...byClassNotMixin)
    }

    // We should add mixin to list of mixins
    if (this.is(_class, CORE_CLASS_MIXIN)) {
      // We should also put a _mixin in list for query
      Model.includeMixinAny(query, _class)

      const byClass = this.extendsOfClass(_class).filter((cl) => this.is(cl._class, CORE_CLASS_MIXIN))
      if (byClass.length > 0) {
        for (const cl of byClass) {
          // We should also put a _mixin in list for query
          Model.includeMixinAny(query, cl._id as Ref<Mixin<Obj>>)
        }
      }
    }
    return { query: query as DocumentQuery<T>, classes }
  }

  /**
   *  Convert a layout into 'dot' notation form if applicable.
   * @param _class - an query or sort options.
   * @param layout - input layout.
   * @param useOperators - will allow to use $elemMatch and $all in case of query.
   * @returns  - an layout with replacement of embedded documents into 'dot' notation.
   */
  public flattenQuery (_class: Ref<Class<Obj>>, layout: AnyLayout, useOperators = true): AnyLayout {
    const l: AnyLayout = {}

    // Also assign a class to value if not specified
    for (const rKey in layout) {
      let match: AttributeMatch
      // TODO: Will be removed with fix to #398
      if (rKey.startsWith('_')) {
        l[rKey] = layout[rKey]
        continue
      }
      if (rKey.indexOf('|') > 0) {
        // So key is probable mixin, let's find a mixin class and try assign value.
        const { mixin, key } = mixinFromKey(rKey)
        match = this.classAttribute(mixin, key)
      } else {
        match = this.classAttribute(_class, rKey)
      }

      const {
        attr,
        key
      } = match
      // Check if we need to perform inner assign based on field value and type
      switch (attr.type._class) {
        case CORE_CLASS_ARRAY_OF: {
          const attrClass = this.attributeClass((attr.type as ArrayOf).of)
          if (attrClass !== undefined) {
            const rValue = layout[rKey]
            if (rValue instanceof Array) {
              let value: unknown[] = []
              for (const rv of (rValue as unknown[])) {
                value = this.flattenArrayValue(value, attrClass, rv as AnyLayout)
              }
              if (!useOperators) {
                throw new Error('operators are required to match with array')
              }
              l[key] = { $all: value as Property<any, any> }
              continue
            } else if (rValue instanceof Object) {
              const q = this.flattenQuery(attrClass, (rValue as unknown) as AnyLayout)
              if (useOperators) {
                // We should use $elemMatch.
                l[key] = { $elemMatch: q }
              } else {
                for (const oo of Object.entries(q)) {
                  l[key + '.' + oo[0]] = oo[1]
                }
              }
              continue
            }
          }
          break
        }
        case CORE_CLASS_INSTANCE_OF: {
          // Flatten any
          const attrClass = ((attr.type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
          if (attrClass !== undefined) {
            for (const oo of Object.entries(this.flattenQuery(attrClass, (layout[rKey] as unknown) as AnyLayout))) {
              l[key + '.' + oo[0]] = oo[1]
            }
            continue
          }
          break
        }
      }
      // Just copy a value here.
      l[key] = layout[rKey]
    }
    return l
  }

  // Q U E R Y

  findSync<T extends Doc> (clazz: Ref<Class<Doc>>, query: DocumentQuery<T>, options?: FindOptions<T>): T[] {
    const { query: realQuery } = this.createQuery(clazz, query)
    const byClass = this.objectsOfClass(realQuery._class as Ref<Class<Doc>>)

    return this.findAll(byClass, clazz, realQuery as unknown as AnyLayout, options) as T[]
  }

  async find<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const result = this.findSync(clazz, query, options)

    if (options?.countCallback !== undefined) {
      options.countCallback(options?.skip ?? 0, options?.limit ?? 0, result.length)
    }

    return await Promise.resolve(result)
  }

  async findOne<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const result = await Promise.resolve(this.findSync(clazz, query, { limit: 1 }))
    return result.length === 0 ? undefined : result[0]
  }

  /**
   * Find all document matching query
   * @param docs - document to find in
   * @param _class - to match against
   * @param query  - to match
   * @param limit - a number of items to find, pass value <= 0 to find all
   */
  protected findAll (docs: Doc[], _class: Ref<Class<Doc>>, query: AnyLayout, options?: FindOptions<any>): Doc[] {
    const result: Doc[] = []
    const clazz = this.getClass(_class)
    let skip = 0
    let limit = 0

    if (options?.skip !== undefined) {
      skip = options.skip
    }
    if (options?.limit !== undefined) {
      limit = options.limit
    }

    for (const doc of docs) {
      if (this.matchQuery(_class, doc, query)) {
        if (clazz === _class) {
          // Push original document.
          if (skip > 0) {
            skip--
          } else {
            result.push(doc)
          }
        } else {
          // In case of mixin we need to cast
          result.push(this.as(doc, _class as Ref<Mixin<Doc>>))
        }
        if (limit > 0 && result.length >= limit) {
          return result
        }
      }
    }
    return (result.length === docs.length) ? docs.concat() : result
  }

  // M I X I N S
  private readonly prototypes = new Map<Ref<Class<Obj>>, Record<string, unknown>>()

  private createPrototype (classifier: Class<Obj>): Record<string, unknown> {
    const attributes = classifier._attributes as { [key: string]: Attribute }
    const descriptors: PropertyDescriptorMap = {}
    for (const key in attributes) {
      const attributeKey = this.attributeKey(classifier, key)
      descriptors[key] = {
        get (this: Proxy) {
          return this.__layout[attributeKey]
        },
        set (this: Proxy, value: any) {
          this.__layout[attributeKey] = value
        }
      }
    }

    // Override _class to return a mixin value.
    descriptors._class = {
      get (this: Proxy) {
        return classifier._id
      }
    }

    const proto = Object.create((classifier._extends !== undefined) ? this.getPrototype(classifier._extends) : Object.prototype)
    return Object.defineProperties(proto, descriptors)
  }

  private getPrototype (mixin: Ref<Class<Obj>>): Record<string, unknown> {
    const proto = this.prototypes.get(mixin)
    if (proto === undefined) {
      const proto = this.createPrototype(this.get(mixin))
      this.prototypes.set(mixin, proto)
      return proto
    }
    return proto
  }

  /**
   * Cast to some mixin, if mixin is not present in class list it will not be added.
   * isMixedIn should be used to ensure if mixin is on place, before modifications.
   * @param doc - incoming document
   * @param mixin - a mixin class
   */
  public as<T extends Obj> (doc: Obj, mixin: Ref<Mixin<T>>): T {
    if (doc._class === mixin) {
      // If we already have a proper class specified.
      return doc as T
    }

    const mixinClass = this.get(mixin)
    if (mixinClass._class !== CORE_CLASS_MIXIN) {
      // Not a mixin class,
      return doc as T
    }
    if (!this.isMixedIn(doc, mixin)) {
      throw new Error(`Class ${doc._class} could not be cast to ${mixin}`)
    }
    const proxy = Object.create(this.getPrototype(mixin)) as Proxy & T
    proxy.__layout = (doc as unknown) as Record<string, unknown>
    return proxy
  }

  /**
   * Perform as for a list of documents and if mixin is not present it will be added.
   * @param doc
   * @param mixin
   */
  public cast<T extends Doc> (doc: Doc, mixin: Ref<Mixin<T>>): T {
    Model.includeMixin(doc, mixin)
    return this.as(doc, mixin)
  }

  public isMixedIn (obj: Obj, _class: Ref<Mixin<Obj>>): boolean {
    return (obj._mixins !== undefined) ? obj._mixins.includes(_class) : false
  }

  public asMixin<T extends Doc> (obj: Obj, _class: Ref<Mixin<T>>, action: (doc: T) => void): void {
    if (this.isMixedIn(obj, _class)) {
      action(this.as(obj, _class))
    }
  }

  // S T O R A G E

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    await Promise.resolve(this.add(doc))
  }

  push<T extends Obj> (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: DocumentValue<T>): void {
    const txOp: TxOperation = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Push,
      _attributes: attributes,
      selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: attribute }]
    }
    this.updateDocument(this.get(_id), [txOp])
  }

  pull<T extends Obj> (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: DocumentValue<T>): void {
    const txOp: TxOperation = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Pull,
      _attributes: attributes,
      selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: attribute, pattern: attributes }]
    }
    this.updateDocument(this.get(_id), [txOp])
  }

  updateDocumentSet<T extends Obj> (doc: T, _attributes: Partial<DocumentValue<T>>): T {
    const txOp: TxOperation = { _class: CORE_CLASS_TX_OPERATION, kind: TxOperationKind.Set, _attributes: _attributes as unknown as AnyLayout }
    return this.updateDocument(doc, [txOp])
  }

  updateDocumentPush<P extends Doc, T extends Obj> (doc: P, _attribute: string, _attributes: DocumentValue<T>): P {
    const txOp: TxOperation = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Push,
      _attributes: _attributes as unknown as AnyLayout,
      selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: _attribute }]
    }
    return this.updateDocument<P>(doc, [txOp])
  }

  updateDocumentPull<P extends Doc, T extends Obj> (doc: P, _attribute: string, _attributes: DocumentQuery<T>): P {
    const txOp: TxOperation = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Pull,
      selector: [{ _class: CORE_CLASS_OBJECT_SELECTOR, key: _attribute, pattern: _attributes as unknown as AnyLayout }]
    }
    return this.updateDocument<P>(doc, [txOp])
  }

  async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<void> {
    await Promise.resolve(this.updateDocument(this.get(_id), operations))
  }

  async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    await Promise.resolve(this.removeDocument(this.get(_id)))
  }

  public removeDocument<T extends Doc> (doc: T): T {
    this.objects.delete(doc._id)
    if (this.byClass !== undefined) {
      const objs = this.byClass.get(doc._class)?.filter((e) => e._id !== doc._id)
      if (objs !== undefined) {
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
  matchQuery<T extends Doc> (_class: Ref<Class<T>>, doc: Doc, query: DocumentQuery<T>): boolean {
    if (!this.is(_class, doc._class)) {
      // Class doesn't match so return false.
      return false
    }
    return this.matchObject(_class, doc, query, false)
  }

  /**
   * Method will check if passed values of object are matched in query.
   * @param _attributes - partial object values of operation.
   * @param query - a query.
   */
  isPartialMatched<T extends Doc> (_class: Ref<Class<Doc>>, _attributes: AnyLayout, query: DocumentQuery<T>): boolean {
    const stripQuery: AnyLayout = {}
    const oKeys = new Set<string>(Object.keys(_attributes))

    // Make a part of query with values in object.
    let keys = 0
    for (const oe of Object.entries(query)) {
      if (oKeys.has(oe[0])) {
        stripQuery[oe[0]] = oe[1]
        keys++
      }
    }
    if (keys === 0) {
      // Not keys to compare, so operation is not fit into our query in any case
      return false
    }

    return this.matchObject<any>(_class, _attributes, stripQuery)
  }

  /**
   * Check if operation to modify attribute has effect on sorting creteria
   * @param _attributes
   * @param sort
   * @returns
   */
  isSortHasEffect<T extends Doc>(_attributes: AnyLayout, sort: DocumentSorting<T>): boolean {
    const oKeys = new Set<string>(Object.keys(_attributes))

    // Make a part of query with values in object.
    let keys = 0
    for (const oe of Object.entries(sort)) {
      if (oKeys.has(oe[0])) {
        keys++
      }
    }
    return keys > 0
  }

  /**
   * Perform matching of document with query.
   * {fullMatch} is used as true to match against array with passing objects, it will match for all values.
   * If used as false, it will find at least one match for object with array value.
   */
  private matchSelector (_class: Ref<Class<Obj>>, doc: Obj, selector?: ObjectSelector[]): { match: boolean, value?: any, attrMatch?: AttributeMatch, doc: Obj, parent: Obj } {
    if ((selector !== undefined) && isValidSelector(selector)) {
      let current = doc
      let parent = doc
      let currentClass = _class

      for (let segmId = 0; segmId < selector.length; segmId++) {
        const segm = selector[segmId]
        if (segm.key === '') {
          throw new Error('Object selector field should be specified')
        }
        const attr = this.classAttribute(currentClass, segm.key)

        if (segm.pattern === undefined) {
          if (segmId === selector.length - 1) {
            // Last one, we could omit check, since it will be for push operation.
            return { match: true, attrMatch: attr, doc: current, parent }
          }
          throw new Error(`Pattern field for middle selector should be specified ${String(selector)}`)
        }
        const attrClass = this.attributeClass(attr.attr.type)

        // If this is our proxy, we should unwrap it.
        const cany = (current as any)
        const docValue = (cany.__layout !== undefined ? cany.__layout : cany)[attr.key]
        const res = this.matchValue(attrClass, docValue, segm.pattern, false)
        if (res === undefined) {
          throw new Error('failed to match embedded object of value')
        }
        if ((attrClass !== undefined) && this.is(attrClass, CORE_CLASS_OBJ)) {
          parent = current
          current = res.value as Obj
          currentClass = attrClass
        }
        if (segmId === selector.length - 1) {
          return { match: true, value: res.value, doc: current, attrMatch: attr, parent }
        } else {
          // If attribute class is based on doc.
          if ((attrClass !== undefined) && !this.is(attrClass, CORE_CLASS_OBJ)) {
            throw new Error(`failed to match embedded object of value for class ${attrClass} of value ${String(current)}`)
          }
        }
      }
    }
    return { match: true, doc, parent: doc }
  }

  private matchObject<T extends Obj> (_class: Ref<Class<T>>, doc: T, query: DocumentQuery<T>, fullMatch = false): boolean {
    if ((doc as any).__layout !== undefined) {
      // This is our proxy, we should unwrap it.
      doc = (doc as any).__layout
    }

    const queryEntries = Object.entries(query)
    const docKeys = new Set(Object.keys(doc))
    let count = 0

    const l = (doc as unknown) as AnyLayout
    for (const [key, value] of queryEntries) {
      if (value === undefined) {
        // Skip undefined as matched.
        count += 1
      }

      const attr = this.classAttribute(_class, key)
      const attrKey = this.attributeKey(attr.clazz, key)

      const keyIn = docKeys.has(attrKey)
      if (keyIn) {
        const docValue = l[attrKey]
        if (attr.attr !== undefined) {
          const mResult = this.matchValue(this.attributeClass(attr.attr.type), docValue, value, fullMatch)
          if (mResult.result) {
            count += 1
          }
        }
      }
    }
    return count === queryEntries.length
  }

  public attributeClass (type: Type): Ref<Class<Doc>> | undefined {
    switch (type._class) {
      case CORE_CLASS_ARRAY_OF:
        return this.attributeClass((type as ArrayOf).of)
      case CORE_CLASS_INSTANCE_OF:
        return ((type as unknown) as Record<string, unknown>).of as Ref<Class<Doc>>
    }
    return undefined
  }

  private matchValue<T extends Obj> (fieldClass: Ref<Class<T>> | undefined, docValue: unknown, value: unknown, fullMatch: boolean): { result: boolean, value?: any } {
    const objDocValue = Object(docValue)
    if (objDocValue !== docValue) {
      // Check if value is primitive, so we will just compare
      if (value instanceof Object) {
        // Check for mongo line matching instructions.
        const vObj = value as RegExpression
        const regex = vObj.$regex
        if (regex !== undefined) {
          const options = vObj.$options
          const reg = RegExp(regex, options)
          return { result: reg.test(docValue as string), value: docValue }
        }
      }
      if (docValue === value) {
        return { result: true, value }
      }
    } else {
      // We got two arrays, so let's compare them
      if (docValue instanceof Array && value instanceof Array) {
        if (docValue.length !== value.length && fullMatch) {
          return { result: false }
        }
        let matchValue: any
        for (let i = 0; i < docValue.length; i++) {
          const val = this.matchValue(fieldClass, docValue[i], value[i], fullMatch)
          if (!val.result && fullMatch) {
            return { result: false }
          }
          matchValue = val.value
        }
        // Return in case match is found
        return { result: true, value: matchValue }
      }

      // We had object, we need to compare inner object, but we need a class
      if (docValue instanceof Array) {
        // Match to find exact value present in array
        for (let i = 0; i < docValue.length; i++) {
          const val = this.matchValue(fieldClass, docValue[i], value, fullMatch)
          if (val.result) {
            return { result: true, value: val.value }
          }
        }
      } else {
        if (fieldClass !== undefined) {
          return {
            result: this.matchObject(fieldClass, docValue as Obj, (value) as AnyLayout),
            value: docValue
          }
        }
      }
    }
    return { result: false }
  }
}
