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

import core from '.'
import { AnyLayout, Attribute, Class, Classifier, ClassifierKind, CollectionOf, Doc, Emb, Mixin, Obj, PropertyType, Ref } from './classes'
import { generateId } from './ids'
import { DocumentQuery, DocumentSorting, DocumentValue, FindOptions, RegExpression } from './storage'

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

interface Proxy {
  __layout: Record<string, unknown>
}

export interface AttributeMatch {
  attr: Attribute
  clazz: Class<Obj>
  key: string
}

interface DescriptivePrototype { prototype: Record<string, unknown>, descriptors: PropertyDescriptorMap }

/**
 * Model is a storage for Class descriptors and useful functions to match class instances to queries and apply values to them based on changes.
 */
export class Model {
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

  public extendsOfClass (_class: Ref<Class<Obj>>): Array<Class<Obj>> {
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
      throw new Error(`document added already ${id}`)
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
    if (this.is(doc._class, core.class.Class)) {
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

  get<T extends Doc>(id: Ref<T>): T {
    const obj = this.objects.get(id)
    if (obj === undefined) {
      throw new Error('document not found ' + id)
    }
    return obj as T
  }

  // U T I L I T Y

  private _getAllAttributes (attributes: AttributeMatch[], _class: Ref<Class<Obj>>): void {
    const clazz = this.get(_class) as Class<Doc>
    for (const attr of clazz._attributes.items ?? []) {
      attributes.push({ attr, clazz, key: this.attributeKey(clazz, attr._id) })
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

  // D O M A I N

  getDomain (id: Ref<Class<Doc>>): string {
    let clazz = this.objects.get(id) as Class<Doc> | undefined
    while (clazz !== undefined) {
      if (clazz._domain !== undefined) return clazz._domain
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
  createDocument<T extends Doc>(_class: Ref<Class<T>>, values: DocumentValue<T>, _id?: Ref<T>): T {
    const doc = this.assign({}, _class, (values as unknown) as AnyLayout) as unknown as T
    doc._id = _id ?? generateId()
    const cl = this.get(_class)
    if (cl._kind === ClassifierKind.MIXIN) {
      // For mixins we need to update _mixin field
      Model.includeMixin(doc, _class)
    }
    return doc
  }

  public classAttribute (cls: Ref<Class<Obj>>, key: string): AttributeMatch {
    // TODO: use memdb class hierarchy
    let _class = cls as Ref<Class<Obj>> | undefined
    while (_class !== undefined) {
      const clazz = this.get(_class)
      const attr = clazz._attributes.items?.find(a => a._id === key)
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
    throw new Error(`attribute not found: ${key} in ${cls}`)
  }

  public pushArrayValue (curValue: unknown, attrClass: Ref<Class<Obj>>, embedded: AnyLayout): PropertyType[] {
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

  getLayout (doc: Obj): AnyLayout {
    if ((doc as any).__layout !== undefined) {
      return ((doc as unknown as Proxy).__layout) as AnyLayout
    }
    return (doc as unknown) as AnyLayout
  }

  public update<T extends Obj>(doc: Doc, _class: Ref<Class<T>>, values: DocumentValue<T>): void {
    const cl = this.get(_class)
    if (cl._kind === ClassifierKind.MIXIN) {
      // We need to include mixin if it is no pressent.
      Model.includeMixin(doc, _class)
    }
    this.assign(this.getLayout(doc), _class, values as unknown as AnyLayout)
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
      if (rKey.indexOf('|') > 0) {
        // So key is probable mixin, this is required to create objects with mixins defined already.
        const { mixin, key } = mixinFromKey(rKey)
        this.assign(layout, mixin, { [key]: r[rKey] })
      } else {
        const { attr, key } = this.classAttribute(_class, rKey)
        // Check if we need to perform inner assign based on field value and type

        switch (attr.type._class) {
          case core.class.CollectionOf: {
            const attrClass = (attr.type as CollectionOf<Emb>).of
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
        }
        const v = r[rKey]
        if (v !== undefined) {
          l[key] = v
        }
      }
    }
    return l
  }

  public mixinDocument<E extends Obj, T extends Obj>(doc: E, clazz: Ref<Mixin<T>>, values: Partial<Omit<T, keyof E>>): void {
    Model.includeMixin(doc, clazz)
    this.assign(this.getLayout(doc), clazz as Ref<Class<Obj>>, (values as unknown) as AnyLayout)
  }

  public static includeMixin<E extends Obj, T extends Obj>(doc: E, clazz: Ref<Mixin<T>>): void {
    this.includeMixinAny(doc, clazz as Ref<Mixin<Obj>>)
  }

  public static includeMixinAny (doc: any, clazz: Ref<Mixin<Obj>>): void {
    if (doc._mixins === undefined) {
      doc._mixins = []
    }
    const mixins = (doc._mixins as Array<Ref<Mixin<Obj>>>)
    if (!mixins.includes(clazz)) {
      mixins.push(clazz)
    }
  }

  mixin<E extends Doc, T extends E>(id: Ref<E>, clazz: Ref<Mixin<T>>, values: Omit<T, keyof E>): void {
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

  getClassMixins (cls: Ref<Class<Obj>>): Array<Ref<Doc>> {
    return this.extendsOfClass(cls).filter(_class => _class._class === core.class.Mixin && _class._id !== cls).map(_class => _class._id)
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

  // Q U E R Y

  find<T extends Doc>(_class: Ref<Class<Doc>>, query: DocumentQuery<T>, options?: FindOptions<T>): T[] {
    const cl = this.getClass(_class)
    const byClass = this.objectsOfClass(cl as Ref<Class<Doc>>)

    return this.findAll(byClass, _class, query as AnyLayout, options).map(p => this.asProxy<T>(p, _class))
  }

  /**
   * Find all document matching query
   * @param docs - document to find in
   * @param _class - to match against
   * @param query  - to match
   * @param limit - a number of items to find, pass value <= 0 to find all
   */
  protected findAll (docs: Doc[], _class: Ref<Class<Obj>>, query: AnyLayout, options?: FindOptions<any>): Doc[] {
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
  private readonly prototypes = new Map<Ref<Class<Obj>>, DescriptivePrototype>()

  private createPrototype (classifier: Class<Obj>): DescriptivePrototype {
    const attributes = classifier._attributes.items ?? []
    const descriptors: PropertyDescriptorMap = {}
    for (const attr of attributes) {
      const attributeKey = this.attributeKey(classifier, attr._id)
      descriptors[attr._id] = {
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

    const proto = Object.create((classifier._extends !== undefined) ? this.getPrototype(classifier._extends).prototype : Object.prototype)
    return { prototype: Object.defineProperties(proto, descriptors), descriptors }
  }

  private getPrototype (mixin: Ref<Class<Obj>>): DescriptivePrototype {
    const proto = this.prototypes.get(mixin)
    if (proto === undefined) {
      const proto = this.createPrototype(this.get(mixin))
      this.prototypes.set(mixin, proto)
      return proto
    }
    return proto
  }

  /**
   * Cast to class or mixin, if mixin is not present in class list it will not be added.
   * isMixedIn should be used to ensure if mixin is on place, before modifications.
   * @param doc - incoming document
   * @param mixin - a mixin class
   */
  public as<T extends Obj>(doc: Obj, _class: Ref<Class<T>>): T {
    if (doc._class === _class && (doc as any).__layout !== undefined) {
      // If we already have a proper class specified.
      return doc as T
    }

    const clazz = this.get(_class)
    if (clazz._class === core.class.Mixin) {
      if (!this.isMixedIn(doc, _class)) {
        throw new Error(`Class ${doc._class} could not be cast to ${_class}`)
      }
    }
    return this.asProxy<T>(doc, _class)
  }

  private asProxy<T extends Obj> (doc: Obj, _class: Ref<Class<T>>): T {
    const proto = this.getPrototype(_class)
    const proxy = Object.create(proto.prototype, proto.descriptors) as Proxy & T
    proxy.__layout = (doc as unknown) as Record<string, unknown>
    return proxy
  }

  /**
   * Perform as for a list of documents and if mixin is not present it will be added.
   * @param doc
   * @param mixin
   */
  public cast<T extends Doc>(doc: Doc, mixin: Ref<Mixin<T>>): T {
    Model.includeMixin(doc, mixin)
    return this.as(doc, mixin)
  }

  public isMixedIn (obj: Obj, _class: Ref<Mixin<Obj>>): boolean {
    return (obj._mixins !== undefined) ? obj._mixins.includes(_class) : false
  }

  public asMixin<T extends Doc>(obj: Obj, _class: Ref<Mixin<T>>, action: (doc: T) => void): void {
    if (this.isMixedIn(obj, _class)) {
      action(this.as(obj, _class))
    }
  }

  // S T O R A G E

  // Q U E R Y  P R O C E S S I N G
  /**
   * Matches query with document
   * @param _class Accept documents with this only specific _class
   * @param doc  document to match against.
   * @param query query to check.
   */
  matchQuery (_class: Ref<Class<Obj>>, doc: Obj, query: DocumentQuery<any>): boolean {
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
  isPartialMatched<T extends Doc>(_class: Ref<Class<Doc>>, _attributes: AnyLayout, query: DocumentQuery<T>): boolean {
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

    // we need a proper class persistence object for mixins to match properly
    const attrValue = this.assign({}, _class, _attributes)
    return this.matchObject<any>(_class, attrValue, stripQuery)
  }

  /**
   * Check if operation to modify attribute has effect on sorting creteria
   * @param _attributes
   * @param sort
   * @returns
   */
  public isSortHasEffect<T extends Doc>(_attributes: AnyLayout, sort: DocumentSorting<T>): boolean {
    const oKeys = new Set<string>(Object.keys(_attributes))
    return Object.keys(sort).some(x => oKeys.has(x))
  }

  private matchObject<T extends Obj>(_class: Ref<Class<T>>, doc: T, query: DocumentQuery<T>, fullMatch = false): boolean {
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
          const mResult = this.matchValue(docValue, value)
          if (mResult.result) {
            count += 1
          }
        }
      }
    }
    return count === queryEntries.length
  }

  public matchValue (docValue: unknown, value: unknown): { result: boolean, value?: any } {
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
        if (docValue.length !== value.length) {
          return { result: false }
        }
        let matchValue: any
        for (let i = 0; i < docValue.length; i++) {
          const val = this.matchValue(docValue[i], value[i])
          if (!val.result) {
            continue
          }
          matchValue = val.value
        }
        // Return in case match is found
        return { result: true, value: matchValue }
      }
    }
    return { result: false }
  }
}
