import { Class, Doc, DomainIndex, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_UPDATE_TX, ObjectTx
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
      case CORE_CLASS_UPDATE_TX:
      case CORE_CLASS_DELETE_TX:
        if (!this.modelDb.is((tx as ObjectTx)._objectClass, this.matchClass)) {
          return await Promise.resolve()
        }
        return await this.storage.tx(ctx, tx)
      default:
        console.log('not implemented tx', tx)
    }
  }
}
