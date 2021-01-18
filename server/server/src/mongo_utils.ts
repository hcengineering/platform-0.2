import { AnyLayout, ArrayOf, Class, Doc, Emb, InstanceOf, Model, Obj, Ref } from '@anticrm/model'
import core from '@anticrm/core'

// Some various mongo db utils.

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
export function createSetArrayFilter (model: Model, _class: Ref<Class<Doc>>, query: AnyLayout, values: AnyLayout): { updateOperation: AnyLayout, arrayFilter: AnyLayout[] } {
  let index = 0
  let nextQuery: AnyLayout | null = query
  let setFilter = ''
  const arrayFilter: AnyLayout[] = []
  const updateOperation: AnyLayout = {}
  let clazz: Ref<Class<Obj>> = _class
  while (nextQuery !== null) {
    const filter: AnyLayout = {}
    const filterName = 'f' + (index++)
    const currentQuery = nextQuery
    const curClass = clazz
    nextQuery = null
    for (const key in currentQuery) {
      const queryValue = currentQuery[key]
      const attr = model.classAttribute(curClass, key)
      const _type = attr.attr.type

      if (_type._class === core.class.ArrayOf) {
        // This is level change.
        if ((_type as ArrayOf).of._class === core.class.InstanceOf) {
          // We moving to next query value.
          nextQuery = (queryValue as unknown) as AnyLayout
          clazz = ((_type as ArrayOf).of as InstanceOf<Emb>).of
          setFilter += (setFilter.length > 0 ? '.' : '') + `${attr.key}.$[${filterName}]`
          continue
        }
      }
      if (_type._class === core.class.InstanceOf) {
        // This is level change.
        // We moving to next query value.
        nextQuery = (queryValue as unknown) as AnyLayout
        clazz = (model.get((_type as InstanceOf<Emb>).of) as unknown) as Ref<Class<Obj>>
        setFilter += (setFilter.length > 0 ? '.' : '') + `${attr.key}.$[${filterName}]`
        continue
      }
      // This is variable marching
      filter[`${filterName}.${attr.key}`] = queryValue
    }
    if (Object.keys(filter).length > 0) {
      arrayFilter.push(filter)
    }
  }

  // Validate fields agains clazz we found last one.
  for (const key in values) {
    const setValue = values[key]
    const attr = model.classAttribute(clazz, key)
    updateOperation[setFilter + `.${attr.key}`] = setValue
  }

  return { updateOperation, arrayFilter }
}
