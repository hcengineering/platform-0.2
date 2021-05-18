import { Class, Doc, Emb, Ref } from '@anticrm/core'
import { Space } from './space'

/**
 * Mixin with information about parent container.
 */
export interface CollectionReference extends Emb {
  // Information about parent
  _parentId: Ref<Doc>
  _parentClass: Ref<Class<Doc>>
  _collection: string
  _parentSpace?: Ref<Space>
}
