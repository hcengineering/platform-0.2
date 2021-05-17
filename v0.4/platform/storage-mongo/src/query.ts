import core, {
  AnyLayout, Class,
  Doc, DocumentQuery, Mixin, Model, Obj, Ref
} from '@anticrm/core'
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
export function toMongoQuery<T extends Doc> (model: Model, _class: Ref<Class<T>>, _query: DocumentQuery<T>): FilterQuery<T> {
  const query = model.assign({}, _class, _query as AnyLayout) as FilterQuery<Doc>

  const cl = model.getClass(_class)
  query._class = cl as Ref<Class<Doc>>
  const classes: Array<Ref<Class<Obj>>> = []

  const byClass = model.extendsOfClass(query._class)
  const byClassNotMixin = byClass.filter((cl) => !model.is(cl._id as Ref<Class<Obj>>, core.class.Mixin)).map(p => p._id as Ref<Class<Obj>>)
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
  if (clazz._class === core.class.Mixin) {
    // We should also put a _mixin in list for query
    Model.includeMixinAny(query, _class)

    const byClass = model.extendsOfClass(_class).filter((cl) => model.is(cl._class, core.class.Mixin))
    if (byClass.length > 0) {
      for (const cl of byClass) {
        // We should also put a _mixin in list for query
        Model.includeMixinAny(query, cl._id as Ref<Mixin<Obj>>)
      }
    }
  }
  return query
}
