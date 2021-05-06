import { Class, Doc, DocumentQuery, FindOptions, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import { CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_UPDATE_TX, CreateTx, DeleteTx, UpdateTx } from '.'
import { updateDocument } from './tx/modeltx'

export class ModelStorage implements Storage {
  model: Model
  constructor (model: Model) {
    this.model = model
  }

  async find<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const result = this.model.find(clazz, query, options)

    if (options?.countCallback !== undefined) {
      options.countCallback(options?.skip ?? 0, options?.limit ?? 0, result.length)
    }

    return await Promise.resolve(result)
  }

  async findOne<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const result = await Promise.resolve(this.model.find(clazz, query, { limit: 1 }))
    return result.length === 0 ? undefined : result[0]
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX: {
        const createTx = tx as CreateTx
        return this.model.add(this.model.createDocument(createTx._objectClass, createTx.object, createTx._objectId))
      }
      case CORE_CLASS_UPDATE_TX: {
        const updateTx = tx as UpdateTx
        return updateDocument(this.model, this.model.get(updateTx._objectId), updateTx.operations)
      }
      case CORE_CLASS_DELETE_TX: {
        const deleteTx = tx as DeleteTx
        return this.model.del(deleteTx._objectId)
      }

      default:
        console.log('not implemented model tx', tx)
    }
  }
}
