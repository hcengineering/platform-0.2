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
  AnyLayout, ArrayOf, Class, CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF, Doc, Emb, InstanceOf, Model, Obj, Ref,
  StringProperty, Type
} from '@anticrm/core'

// Some various mongo db utils.

function isArrayOf (_type: Type): boolean {
  return _type._class === CORE_CLASS_ARRAY_OF
}

function isInstanceOf (_type: Type): boolean {
  return _type._class === CORE_CLASS_INSTANCE_OF
}

function extractArrayFilter (model: Model, _class: Ref<Class<Doc>>, query: AnyLayout, isPull: boolean): {
  clazz: Ref<Class<Obj>>
  setFilter: string,
  arrayFilter: AnyLayout[],
  lastQuery?: AnyLayout
  isArrayAttr?: boolean
} {
  let index = 0
  let nextQuery: AnyLayout | null = query
  let setFilter = ''
  let noNextFilter = ''
  const arrayFilter: AnyLayout[] = []
  let isArrayAttr = false

  let clazz: Ref<Class<Obj>> = _class
  while (nextQuery !== null) {
    const filter: AnyLayout = {}
    const curI = index++
    const filterName = `f${curI}`
    const nextFilterName = `f${curI + 1}`
    const currentQuery = nextQuery
    const curClass = clazz
    nextQuery = null

    if (isPull) {
      // Check all attributes is not instance, array and extract it as final pull request argument
      let isSimple = true

      for (const key in currentQuery) {
        const attr = model.classAttribute(curClass, key)
        const _type = attr.attr.type
        if ((isArrayOf(_type) && isInstanceOf((_type as ArrayOf).of)) || isInstanceOf(_type)) {
          isSimple = false
          break
        }
      }
      if (isSimple) {
        return {
          clazz,
          setFilter: noNextFilter,
          arrayFilter,
          lastQuery: currentQuery,
          isArrayAttr
        }
      }
    }
    for (const key in currentQuery) {
      const queryValue = currentQuery[key]
      const attr = model.classAttribute(curClass, key)
      const _type = attr.attr.type

      if (isArrayOf(_type)) {
        // This is level change.
        if (isInstanceOf((_type as ArrayOf).of)) {
          // We moving to next query value.
          nextQuery = (queryValue as unknown) as AnyLayout
          clazz = ((_type as ArrayOf).of as InstanceOf<Emb>).of
          noNextFilter = setFilter + (setFilter.length > 0 ? '.' : '') + attr.key
          setFilter = `${noNextFilter}.$[${nextFilterName}]`
          isArrayAttr = true
          continue
        }
      }
      if (isInstanceOf(_type)) {
        // This is level change.
        // We moving to next query value.
        nextQuery = (queryValue as unknown) as AnyLayout
        clazz = (model.get((_type as InstanceOf<Emb>).of) as unknown) as Ref<Class<Obj>>
        noNextFilter = setFilter + (setFilter.length > 0 ? '.' : '') + attr.key
        setFilter = `${noNextFilter}.$[${nextFilterName}]`
        isArrayAttr = false
        continue
      }
      // This is variable marching
      if (attr.key !== '_class') { // Ignore _class fields.
        filter[`${filterName}.${attr.key}`] = queryValue
      }
    }
    if (Object.keys(filter).length > 0) {
      arrayFilter.push(filter)
    }
  }
  return {
    clazz,
    setFilter,
    arrayFilter
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
export function createSetArrayFilters (model: Model, _class: Ref<Class<Doc>>, query: AnyLayout, values: AnyLayout): { updateOperation: AnyLayout, arrayFilter: AnyLayout[] } {
  const updateOperation: AnyLayout = {}

  const {
    clazz,
    setFilter,
    arrayFilter
  } = extractArrayFilter(model, _class, query, false)

  // Validate fields agains clazz we found last one.
  for (const key in values) {
    const setValue = values[key]
    const attr = model.classAttribute(clazz, key)
    updateOperation[setFilter + `.${attr.key}`] = setValue
  }

  return {
    updateOperation,
    arrayFilter
  }
}

export function createPushArrayFilters (model: Model, _class: Ref<Class<Doc>>, query: AnyLayout, attribute: StringProperty | null, values: AnyLayout): { updateOperation: AnyLayout, arrayFilters: AnyLayout[] } {
  const {
    clazz,
    setFilter,
    arrayFilter
  } = extractArrayFilter(model, _class, query, false)

  let op = setFilter
  if (attribute) {
    op += '.' + (attribute as string)
  }

  const updateOperation: AnyLayout = {
    [op]: {
      _class: (clazz as unknown) as StringProperty,
      ...values
    }
  }
  return {
    updateOperation,
    arrayFilters: arrayFilter
  }
}

export function createPullArrayFilters (model: Model, _class: Ref<Class<Doc>>, query: AnyLayout): { updateOperation: AnyLayout, arrayFilters: AnyLayout[], isArrayAttr?: boolean } {
  const {
    clazz,
    setFilter,
    arrayFilter,
    lastQuery,
    isArrayAttr
  } = extractArrayFilter(model, _class, query, true)

  const updateOperation: AnyLayout = {
    [setFilter]: {
      _class: (clazz as unknown) as StringProperty,
      ...lastQuery
    }
  }
  return {
    updateOperation,
    arrayFilters: arrayFilter,
    isArrayAttr
  }
}
