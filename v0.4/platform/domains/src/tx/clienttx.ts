import { Class, Doc, DocumentQuery, Emb, FindOptions, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import { CollectionId } from '@anticrm/core/src/colletionid'

const systemUser = 'system'

/**
 * A storage to create a client transactions into txContext and pass execution to delegate
 */
export class ClientTxStorage implements Storage {
  private readonly delegateStorage: Storage

  constructor (delegateStorage: Storage) {
    this.delegateStorage = delegateStorage
  }

  private addTx (ctx: TxContext, tx: Tx): void {
    ctx.clientTx.push(tx)
  }

  async tx (ctx: TxContext, tx: Tx): Promise<void> {
    tx._user = systemUser
    this.addTx(ctx, tx)
    await this.delegateStorage.tx(ctx, tx)
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return await this.delegateStorage.find(_class, query, options)
  }

  async findIn <T extends Doc, C extends Emb>(
    _class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>,
    _itemClass: Ref<Class<C>>, query: DocumentQuery<C>,
    options?: FindOptions<C>): Promise<C[]> {
    return await this.delegateStorage.findIn<T, C>(_class, _id, _collection, _itemClass, query, options)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.delegateStorage.findOne(_class, query)
  }
}
