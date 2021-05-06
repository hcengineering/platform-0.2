import { Class, Doc, DocumentQuery, FindOptions, Ref, Storage, StringProperty, Tx, TxContext } from '@anticrm/core'

const systemUser = 'system' as StringProperty

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

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.delegateStorage.findOne(_class, query)
  }
}
