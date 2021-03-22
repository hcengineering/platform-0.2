import { AnyLayout, Class, Doc, Ref, Storage, StringProperty, Tx, TxContext } from '@anticrm/core'
import { newCreateTx, newDeleteTx, newPushTx, newUpdateTx } from './tx'

const systemUser = 'system' as StringProperty

/**
 * A storage to create a client transactions into txContext and pass execution to delegate
 */
export class ClientTxStorage implements Storage {
  private readonly delegateStorage: Storage

  constructor (delegateStorage: Storage) {
    this.delegateStorage = delegateStorage
  }

  private addTx (ctx: TxContext, tx: Tx) {
    if (!ctx.clientTx) {
      ctx.clientTx = []
    }
    ctx.clientTx.push(tx)
  }

  store (ctx: TxContext, doc: Doc): Promise<void> {
    this.addTx(ctx, newCreateTx(doc, systemUser))
    return this.delegateStorage.store(ctx, doc)
  }

  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void> {
    this.addTx(ctx, newPushTx(_class, _id, query || undefined, attribute, attributes, systemUser))
    return this.delegateStorage.push(ctx, _class, _id, query, attribute, attributes)
  }

  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attributes: AnyLayout): Promise<void> {
    this.addTx(ctx, newUpdateTx(_class, _id, query || undefined, attributes, systemUser))
    return this.delegateStorage.update(ctx, _class, _id, query, attributes)
  }

  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null): Promise<void> {
    this.addTx(ctx, newDeleteTx(_class, _id, query || undefined, systemUser))
    return this.delegateStorage.remove(ctx, _class, _id, query)
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.delegateStorage.find(_class, query)
  }

  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
    return this.delegateStorage.findOne(_class, query)
  }
}
