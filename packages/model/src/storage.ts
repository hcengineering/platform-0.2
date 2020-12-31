import { AnyLayout, Class, Doc, Ref, StringProperty } from './classes'
import { TxContext } from './tx'

export interface Storage {
  store (ctx: TxContext, doc: Doc): Promise<void>
  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: StringProperty, attributes: AnyLayout): Promise<void>
  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: AnyLayout): Promise<void>
  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void>

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
}
