import {
  AnyLayout, ArrayOf, AttributeMatch, Class, CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF, CORE_CLASS_MIXIN,
  Doc, DocumentQuery, Emb, InstanceOf, Mixin, mixinFromKey, Model, Obj, PropertyType, Ref, Type
} from '@anticrm/core'
import { isValidSelector, ObjectSelector } from '@anticrm/domains'
import { FilterQuery } from 'mongodb'

/**
   * Creates a query with filled class and mixin information properly set.
   **
   * @param _class - a class query is designed for.
   * @param _query - a query object to convert to.
   * @param flatten - use a flat key layout, based on docs mongo support both variants, but mostly dot notation work better.
   *
   * flatten queries are applicable only for mongoDB and not supported by model search operations.
   */
export function toMongoQuery<T extends Doc> (model: Model, _class: Ref<Class<T>>, _query: DocumentQuery<T>, flatten = true): FilterQuery<T> {
  let query = model.assign({}, _class, _query as AnyLayout) as FilterQuery<Doc>

  if (flatten) {
    query = flattenQuery(model, _class, query)
  }

  const cl = model.getClass(_class)
  query._class = cl as Ref<Class<Doc>>
  const classes: Array<Ref<Class<Obj>>> = []

  const byClass = model.extendsOfClass(query._class)
  const byClassNotMixin = byClass.filter((cl) => !model.is(cl._id as Ref<Class<Obj>>, CORE_CLASS_MIXIN)).map(p => p._id as Ref<Class<Obj>>)
  if (byClassNotMixin.length > 0) {
    // We need find for all classes extending our own.
    classes.push(...byClassNotMixin)
  }

  // Find by all classes.
  if (classes.length > 0) {
    query._class = { $in: classes.map(cl => cl as Ref<Class<Doc>>) }
  }

  // We should add mixin to list of mixins
  const clazz = model.get(_class)
  if (clazz._class === CORE_CLASS_MIXIN) {
    // We should also put a _mixin in list for query
    Model.includeMixinAny(query, _class)

    const byClass = model.extendsOfClass(_class).filter((cl) => model.is(cl._class, CORE_CLASS_MIXIN))
    if (byClass.length > 0) {
      for (const cl of byClass) {
        // We should also put a _mixin in list for query
        Model.includeMixinAny(query, cl._id as Ref<Mixin<Obj>>)
      }
    }
  }
  return query
}

/**
   *  Convert a layout into 'dot' notation form if applicable.
   * @param _class - an query or sort options.
   * @param layout - input layout.
   * @param useOperators - will allow to use $elemMatch and $all in case of query.
   * @returns  - an layout with replacement of embedded documents into 'dot' notation.
   */
export function flattenQuery (model: Model, _class: Ref<Class<Obj>>, layout: AnyLayout, useOperators = true): AnyLayout {
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
      match = model.classAttribute(mixin, key)
    } else {
      match = model.classAttribute(_class, rKey)
    }

    const { attr, key } = match
    // Check if we need to perform inner assign based on field value and type
    switch (attr.type._class) {
      case CORE_CLASS_ARRAY_OF: {
        const attrClass = model.attributeClass((attr.type as ArrayOf).of)
        if (attrClass !== undefined) {
          const rValue = layout[rKey]
          if (rValue instanceof Array) {
            let value: unknown[] = []
            for (const rv of (rValue as unknown[])) {
              value = flattenArrayValue(model, value, attrClass, rv as AnyLayout)
            }
            if (!useOperators) {
              throw new Error('operators are required to match with array')
            }
            l[key] = { $all: value as PropertyType }
            continue
          } else if (rValue instanceof Object) {
            const q = flattenQuery(model, attrClass, (rValue as unknown) as AnyLayout)
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
          for (const oo of Object.entries(flattenQuery(model, attrClass, (layout[rKey] as unknown) as AnyLayout))) {
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
function flattenArrayValue (model: Model, curValue: unknown, attrClass: Ref<Class<Doc>>, embedded: AnyLayout): PropertyType[] {
  // Assign into  a proper classed values.
  const objValue = flattenQuery(model, attrClass, embedded)
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
// Some various mongo db utils.

function isArrayOf (_type: Type): boolean {
  return _type._class === CORE_CLASS_ARRAY_OF
}

function isInstanceOf (_type: Type): boolean {
  return _type._class === CORE_CLASS_INSTANCE_OF
}
export interface ArrayFilterResult {
  clazz: Ref<Class<Obj>>
  setFilter: string
  arrayFilter: AnyLayout[]
  lastQuery?: AnyLayout
  isArrayAttr: boolean
  index: number
  attribute?: AttributeMatch
  isPrimitive: boolean
}

function extractArrayFilter (model: Model, _class: Ref<Class<Doc>>, selector: ObjectSelector[], isPull: boolean, index: number): ArrayFilterResult {
  let setFilter = ''
  let noNextFilter = ''
  const arrayFilter: AnyLayout[] = []
  let isArrayAttr = false
  let isPrimitive = false

  let clazz: Ref<Class<Obj>> = _class
  let lastAttribute: AttributeMatch | undefined
  for (let segmId = 0; segmId < selector.length; segmId++) {
    const segm = selector[segmId]
    if (segm.key === '') {
      throw new Error('Object selector field should be specified')
    }
    const attr = model.classAttribute(clazz, segm.key)
    if (attr === undefined) {
      throw new Error('Object selector field is not found in class attributes')
    }
    lastAttribute = attr
    const filter: AnyLayout = {}
    const curI = index++
    const filterName = `f${curI}`

    const _type = attr.attr.type

    isArrayAttr = isArrayOf(_type)
    if (isArrayAttr) {
      // This is level change.
      if (isInstanceOf((_type as ArrayOf).of)) {
        // We moving to next query value.
        clazz = ((_type as ArrayOf).of as InstanceOf<Emb>).of
      } else {
        isPrimitive = true
      }
    } else if (isInstanceOf(_type)) {
      // This is level change.
      // We moving to next query value.
      clazz = (_type as InstanceOf<Emb>).of
    } else {
      throw new Error(`Object selector field type is unsupported ${String(_type)} `)
    }
    if (segm.pattern !== undefined) {
      noNextFilter = setFilter + (setFilter.length > 0 ? '.' : '') + attr.key
      setFilter = `${noNextFilter}.$[${filterName}]`
    }

    if (isPull && segmId === selector.length - 1) {
      // In case of pull
      return {
        clazz,
        setFilter: noNextFilter,
        arrayFilter,
        lastQuery: segm.pattern as AnyLayout,
        isArrayAttr,
        index,
        attribute: lastAttribute,
        isPrimitive
      }
    }
    if (segm.pattern !== undefined && typeof segm.pattern === 'object') {
      for (const queryE of Object.entries(segm.pattern)) {
        const pAttr = model.classAttribute(clazz, queryE[0])
        // This is variable marching
        if (pAttr.key !== '_class') { // Ignore _class fields.
          filter[`${filterName}.${pAttr.key}`] = queryE[1] as any
        }
      }
    } else if (segm.pattern !== undefined) {
      filter[`${filterName}`] = segm.pattern
    }
    if (Object.keys(filter).length > 0) {
      arrayFilter.push(filter)
    }
  }
  return {
    clazz,
    setFilter,
    arrayFilter,
    isArrayAttr,
    index,
    attribute: lastAttribute,
    isPrimitive
  }
}

/**
   * Creates a arrayFilters and $set, $pull, $push operations.
   *
   *
   {
      users: {
          userId: "john.appleseed@gmail.com",
          fields: {
              "_id": "v1"
          }
      }
    }
   Should be converted to
   db.getCollection('model').update(
   { "_id" : "600051cf1262e1e345ad169b"},
   { $set: {
            "users.$[f1].fields.$[f2].v": 12,
            } },
   { arrayFilters: [
              {"f1.userId": "john.appleseed@gmail.com" },
              {"f2._id": "v1" }],
        }
   )

   Function will create a pair of $set operation object and a applyFilters section.
   */
export function createSetArrayFilters (model: Model, _class: Ref<Class<Doc>>, selector: ObjectSelector[] | undefined, values: AnyLayout, index: number): { updateOperation: AnyLayout, arrayFilter: AnyLayout[], index: number } {
  if ((selector === undefined) || selector.length === 0) {
    // Object itself apply operation.
    const value = model.assign({}, _class, values)
    delete value._class // We should not override _class in any case
    return { updateOperation: value, arrayFilter: [], index }
  }
  const updateOperation: AnyLayout = {}

  const {
    clazz,
    setFilter,
    arrayFilter,
    index: resIndex
  } = extractArrayFilter(model, _class, selector, false, index)

  // Validate fields agains clazz we found last one.
  for (const key in values) {
    const setValue = values[key]
    const attr = model.classAttribute(clazz, key)
    updateOperation[setFilter + `.${attr.key}`] = setValue
  }

  return {
    updateOperation,
    arrayFilter,
    index: resIndex
  }
}

export function createPushArrayFilters (model: Model, _class: Ref<Class<Doc>>, selector: ObjectSelector[] | undefined, values: AnyLayout, index: number): {
  updateOperation: AnyLayout
  arrayFilters: AnyLayout[]
  index: number
} {
  if ((selector === undefined) || !isValidSelector(selector)) {
    throw new Error('push requires a valid selector')
  }
  const {
    clazz,
    setFilter,
    arrayFilter,
    index: resIndex,
    attribute
  } = extractArrayFilter(model, _class, selector, false, index)

  let op = setFilter
  if (attribute !== undefined) {
    if (op.length > 0) {
      op += '.'
    }
    op += attribute.name
  }

  const updateOperation: AnyLayout = {
    [op]: {
      _class: clazz,
      ...values
    }
  }
  return {
    updateOperation,
    arrayFilters: arrayFilter,
    index: resIndex
  }
}

export function createPullArrayFilters (model: Model, _class: Ref<Class<Doc>>, selector: ObjectSelector[] | undefined, index: number): {
  updateOperation: AnyLayout
  arrayFilters: AnyLayout[]
  isArrayAttr: boolean
  index: number
} {
  if ((selector === undefined) || !isValidSelector(selector)) {
    throw new Error('pull requires a valid selector')
  }
  const {
    clazz,
    setFilter,
    arrayFilter,
    lastQuery,
    isArrayAttr,
    index: resIndex,
    isPrimitive
  } = extractArrayFilter(model, _class, selector, true, index)

  let updateOperation: AnyLayout
  if (!isPrimitive) {
    updateOperation = {
      [setFilter]: {
        _class: clazz,
        ...lastQuery
      }
    }
  } else {
    updateOperation = { [setFilter]: lastQuery }
  }
  return {
    updateOperation,
    arrayFilters: arrayFilter,
    isArrayAttr,
    index: resIndex
  }
}
