import { Class, Doc, DomainIndex, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX,
  CORE_CLASS_PUSH_TX,
  CORE_CLASS_UPDATE_TX,
  CORE_CLASS_VDOC,
  CreateTx, DeleteTx,
  PushTx,
  UpdateTx
} from '../index'

export class FilterIndex implements DomainIndex {
  private modelDb: Model
  private storage: Storage
  private filterClass: Ref<Class<Doc>>

  constructor (modelDb: Model, storage: Storage, filterClass: Ref<Class<Doc>>) {
    this.modelDb = modelDb
    this.storage = storage
    this.filterClass = filterClass
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_PUSH_TX:
        return this.onPush(ctx, tx as PushTx)
      case CORE_CLASS_DELETE_TX:
        return this.onDelete(ctx, tx as PushTx)
      default:
        console.log('not implemented tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    if (!this.modelDb.is(create._objectClass, this.filterClass)) {
      return Promise.resolve()
    }
    return this.storage.store(ctx, this.modelDb.newDoc(create._objectClass, create._objectId, create.object))
  }

  onPush (ctx: TxContext, tx: PushTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, this.filterClass)) {
      return Promise.resolve()
    }
    return this.storage.push(ctx, tx._objectClass, tx._objectId, null, tx._attribute, tx._attributes)
  }

  onDelete (ctx: TxContext, tx: DeleteTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, this.filterClass)) {
      return Promise.resolve()
    }
    return this.storage.remove(ctx, tx._objectClass, tx._objectId, tx._query || null)
  }

  onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, this.filterClass)) {
      return Promise.resolve()
    }
    return this.storage.update(ctx, tx._objectClass, tx._objectId, null, tx._attributes)
  }
}
