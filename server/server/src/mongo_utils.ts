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

import {
  AnyLayout, ArrayOf, AttributeMatch, Class, CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF, Doc, Emb, InstanceOf,
  isValidSelector, Model,
  Obj, Property, Ref,
  StringProperty, Type
} from '@anticrm/core'
import { ObjectSelector } from '@anticrm/domains'

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
        lastQuery: segm.pattern,
        isArrayAttr,
        index,
        attribute: lastAttribute,
        isPrimitive
      }
    }
    if (segm.pattern !== undefined && typeof segm.pattern === 'object') {
      for (const queryE of Object.entries(segm.pattern as AnyLayout)) {
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
      _class: (clazz as unknown) as StringProperty,
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
        _class: (clazz as unknown) as StringProperty,
        ...lastQuery
      }
    }
  } else {
    updateOperation = { [setFilter]: lastQuery as Property<any, any> }
  }
  return {
    updateOperation,
    arrayFilters: arrayFilter,
    isArrayAttr,
    index: resIndex
  }
}
