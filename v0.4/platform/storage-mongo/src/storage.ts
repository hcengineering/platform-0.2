import { AnyLayout, Class, Doc, DocumentQuery, FindOptions, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import { CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_UPDATE_TX, CORE_CLASS_VDOC, CreateTx, DeleteTx, TxOperationKind, UpdateTx, VDoc } from '@anticrm/domains'
import { Collection, Db, FilterQuery, SortOptionObject, UpdateOneOptions, UpdateQuery } from 'mongodb'
import { createPullArrayFilters, createPushArrayFilters, createSetArrayFilters, flattenQuery, toMongoQuery } from './query'

export class MongoStorage implements Storage {
  readonly model: Model
  readonly db: Db

  constructor (model: Model, db: Db) {
    this.model = model
    this.db = db
  }

  private collection<T extends Doc> (_class: Ref<Class<T>>): Collection {
    const domain = this.model.getDomain(_class)
    return this.db.collection(domain)
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX: {
        return await this.store(ctx, tx as CreateTx)
      }
      case CORE_CLASS_UPDATE_TX: {
        return await this.update(ctx, tx as UpdateTx)
      }
      case CORE_CLASS_DELETE_TX: {
        return await this.remove(ctx, tx as DeleteTx)
      }

      default:
        console.log('not implemented model tx', tx)
    }
  }

  async store (ctx: TxContext, tx: CreateTx): Promise<any> {
    const doc = this.model.createDocument(tx._objectClass, tx.object, tx._objectId)
    if (this.model.is(tx._objectClass, CORE_CLASS_VDOC)) {
      if (tx._objectSpace === undefined) {
        throw new Error('vdoc space should be specified')
      }
      (doc as VDoc)._space = tx._objectSpace
    }
    await this.collection(doc._class).insertOne(doc)
  }

  async update (ctx: TxContext, tx: UpdateTx): Promise<any> {
    let setUpdateChain: any = {}
    let pushUpdateChain: any = {}
    let pullUpdateChain: any = {}
    let unsetUpdateChain: any = {}
    let index = 1

    const arrayFilters: AnyLayout[] = []
    for (const op of tx.operations) {
      switch (op.kind) {
        case TxOperationKind.Set: {
          const filters = createSetArrayFilters(this.model, tx._objectClass, op.selector, op._attributes ?? {}, index)
          setUpdateChain = { ...setUpdateChain, ...filters.updateOperation }
          arrayFilters.push(...filters.arrayFilter)
          index = filters.index
          break
        }
        case TxOperationKind.Push: {
          const filters = createPushArrayFilters(this.model, tx._objectClass, op.selector, op._attributes ?? {}, index)
          pushUpdateChain = { ...pushUpdateChain, ...filters.updateOperation }
          arrayFilters.push(...filters.arrayFilters)
          break
        }
        case TxOperationKind.Pull: {
          const filters = createPullArrayFilters(this.model, tx._objectClass, op.selector, index)
          if (filters.isArrayAttr) {
            pullUpdateChain = { ...pullUpdateChain, ...filters.updateOperation }
            arrayFilters.push(...filters.arrayFilters)
          } else {
            unsetUpdateChain = { ...unsetUpdateChain, ...filters.updateOperation }
            arrayFilters.push(...filters.arrayFilters)
          }
          break
        }
      }
    }

    const updateOp: UpdateQuery<any> = {}
    const opts: UpdateOneOptions = {}
    if (Object.keys(setUpdateChain).length > 0) {
      updateOp.$set = setUpdateChain
    }
    if (Object.keys(unsetUpdateChain).length > 0) {
      updateOp.$unset = unsetUpdateChain
    }
    if (Object.keys(pushUpdateChain).length > 0) {
      updateOp.$push = pushUpdateChain
    }
    if (Object.keys(pullUpdateChain).length > 0) {
      updateOp.$pull = pullUpdateChain
    }
    if (arrayFilters.length > 0) {
      opts.arrayFilters = arrayFilters
    }

    const filter: FilterQuery<Doc> = { _id: tx._objectId }
    if (tx._objectSpace !== undefined) {
      filter._space = tx._objectSpace
    }
    console.log('update', filter, updateOp, opts)
    return await this.collection(tx._objectClass).updateOne(filter, updateOp, opts)
  }

  async remove (ctx: TxContext, tx: DeleteTx): Promise<any> {
    const filter: FilterQuery<Doc> = { _id: tx._objectId }
    if (tx._objectSpace !== undefined) {
      filter._space = tx._objectSpace
    }
    return await this.collection(tx._objectClass).deleteOne(filter)
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const mongoQuery = toMongoQuery(this.model, _class, query, true)

    // We should use aggregation and return a number of elements if we had limit or skip specified.
    if (options?.limit !== undefined || options?.skip !== undefined) {
      const resultQuery: any = [
        { $match: mongoQuery },
        { $skip: options.skip ?? 0 }
      ]
      if (options?.limit !== undefined) {
        resultQuery.push({ $limit: options.limit ?? 0 })
      }
      if (options?.sort !== undefined) {
        let sortOptions: AnyLayout = (options.sort ?? {}) as unknown as AnyLayout
        sortOptions = flattenQuery(this.model, _class, sortOptions, false)
        resultQuery.push({ $sort: sortOptions })
      }
      const resultValue = this.collection(_class).aggregate<any>([{
        $facet: {
          results: resultQuery,
          totalCount: [
            { $match: mongoQuery },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      }])
      const resValue = (await resultValue.toArray())[0]

      // Notify callback about counts.
      if (options?.countCallback !== undefined) {
        if (resValue.totalCount.length > 0) {
          options.countCallback(options.skip ?? 0, options.limit ?? 0, resValue.totalCount[0].count)
        } else {
          options.countCallback(options.skip ?? 0, options.limit ?? 0, 0)
        }
      }

      return resValue.results
    }

    // Use standalone without limit and skip.
    let cursor = this.collection(_class).find(mongoQuery)

    if (options?.sort !== undefined) {
      let sortOptions: AnyLayout = (options.sort ?? {}) as unknown as AnyLayout
      sortOptions = flattenQuery(this.model, _class, sortOptions, false)
      cursor = cursor.sort(sortOptions as SortOptionObject<Doc>)
    }

    const values = await cursor.toArray()
    // Notify callback about counts.
    if (options?.countCallback !== undefined) {
      options.countCallback(0, 0, values.length)
    }
    return values
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const mongoQuery = toMongoQuery(this.model, _class, query, true)

    const result = await this.collection(_class).findOne<T>(mongoQuery)
    if (result === null) {
      return undefined
    }
    return result
  }
}
