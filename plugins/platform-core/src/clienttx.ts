import { Class, Doc, DocumentQuery, Ref, Storage, StringProperty, Tx, TxContext } from '@anticrm/core'
import { newCreateTx, newDeleteTx, newUpdateTx } from './tx'
import { TxOperation } from '@anticrm/domains'

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

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    this.addTx(ctx, newCreateTx(doc, systemUser))
    await this.delegateStorage.store(ctx, doc)
  }

  async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<void> {
    this.addTx(ctx, newUpdateTx(_class, _id, operations, systemUser))
    await this.delegateStorage.update(ctx, _class, _id, operations)
  }

  async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    this.addTx(ctx, newDeleteTx(_class, _id, systemUser))
    await this.delegateStorage.remove(ctx, _class, _id)
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T[]> {
    return await this.delegateStorage.find(_class, query)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.delegateStorage.findOne(_class, query)
  }
}
