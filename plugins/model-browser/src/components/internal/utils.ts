import { ArrayOf, CORE_CLASS_ARRAY_OF, CORE_CLASS_BAG_OF, CORE_CLASS_INSTANCE_OF, CORE_CLASS_REF_TO, Doc, Emb, InstanceOf, RefTo, Type } from '@anticrm/core'

export function toTypeStr (value: Type): string {
  switch (value._class) {
    case CORE_CLASS_ARRAY_OF:
      return toTypeStr((value as ArrayOf).of) + '[]'
    case CORE_CLASS_BAG_OF:
      return '{ string: ' + toTypeStr((value as ArrayOf).of) + ' }'
    case CORE_CLASS_REF_TO:
      return '-> ' + (value as RefTo<Doc>).to
    case CORE_CLASS_INSTANCE_OF:
      return (value as InstanceOf<Emb>).of
  }
  return value._class
}
