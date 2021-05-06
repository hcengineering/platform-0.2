import { Class, Doc, DomainIndex, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX,
  CORE_CLASS_UPDATE_TX,
  CreateTx, DeleteTx,
  UpdateTx
} from '../index'

/**
 * Index to pass through a specified class to storage.
 */
export class PassthroughsIndex implements DomainIndex {
  protected readonly modelDb: Model
  protected readonly storage: Storage
  private readonly matchClass: Ref<Class<Doc>>

  constructor (modelDb: Model, storage: Storage, matchClass: Ref<Class<Doc>>) {
    this.modelDb = modelDb
    this.storage = storage
    this.matchClass = matchClass
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_DELETE_TX:
        return this.onDelete(ctx, tx as DeleteTx)
      default:
        console.log('not implemented tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    if (!this.modelDb.is(create._objectClass, this.matchClass)) {
      return Promise.resolve()
    }
    return this.storage.store(ctx, this.modelDb.newDoc(create._objectClass, create._objectId, create.object))
  }

  onDelete (ctx: TxContext, tx: DeleteTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, this.matchClass)) {
      return Promise.resolve()
    }
    return this.storage.remove(ctx, tx._objectClass, tx._objectId)
  }

  onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, this.matchClass)) {
      return Promise.resolve()
    }
    return this.storage.update(ctx, tx._objectClass, tx._objectId, tx.operations)
  }
}
