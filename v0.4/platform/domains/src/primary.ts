import { Class, Doc, Mixin, mixinKey, Model, Obj, Ref } from '@anticrm/core'

/**
 * Indic
 */
export interface Indices extends Mixin<Doc> {
  primary: string
}
export const CORE_MIXIN_INDICES = 'mixin:core.Indices' as Ref<Mixin<Indices>>

export function getPrimaryKey (model: Model, _class: Ref<Class<Obj>>): string | undefined {
  const primaryKey = mixinKey(CORE_MIXIN_INDICES, 'primary')
  let cls = _class as Ref<Class<Obj>> | undefined
  while (cls !== undefined) {
    const clazz = model.get(cls)
    const primary = (clazz as any)[primaryKey]
    if (primary !== undefined) {
      return primary
    }
    cls = clazz._extends
  }
  return undefined
}
