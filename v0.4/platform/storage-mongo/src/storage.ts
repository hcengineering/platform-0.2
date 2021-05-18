import { AnyLayout, Class, CollectionOf, Doc, DocumentQuery, Emb, FindOptions, Model, Obj, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import domains, { AddItemTx, CollectionId, collectionId, CollectionReference, CreateTx, DeleteTx, ItemTx, processTransactions, RemoveItemTx, TxOperations, UpdateItemTx, UpdateTx, VDoc } from '@anticrm/domains'
import { Collection, Db, FilterQuery, SortOptionObject } from 'mongodb'
import { toMongoQuery } from './query'

export class MongoStorage implements Storage, TxOperations {
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
    return await processTransactions(ctx, tx, this)
  }

  async onCreateTx (ctx: TxContext, tx: CreateTx): Promise<any> {
    const doc = this.model.createDocument(tx._objectClass, tx.attributes, tx._objectId)
    if (this.model.is(tx._objectClass, domains.class.VDoc)) {
      if (tx._objectSpace === undefined) {
        throw new Error('vdoc space should be specified')
      }
      (doc as VDoc)._space = tx._objectSpace
    }
    await this.collection(tx._objectClass).insertOne(doc)
  }

  async onUpdateTx (ctx: TxContext, tx: UpdateTx): Promise<any> {
    const filter: FilterQuery<Doc> = { _id: tx._objectId }
    if (tx._objectSpace !== undefined) {
      filter._space = tx._objectSpace
    }

    const assignValue = this.model.assign({}, tx._objectClass, tx.attributes)
    delete (assignValue._class)
    return await this.collection(tx._objectClass).updateOne(filter, { $set: assignValue })
  }

  async onDeleteTx (ctx: TxContext, tx: DeleteTx): Promise<any> {
    const filter: FilterQuery<Doc> = { _id: tx._objectId }
    if (tx._objectSpace !== undefined) {
      filter._space = tx._objectSpace
    }
    return await this.collection(tx._objectClass).deleteOne(filter)
  }

  async onAddItemTx (ctx: TxContext, tx: AddItemTx): Promise<any> {
    const doc = this.model.createDocument<Emb>(tx._itemClass, tx.attributes, tx._itemId)

    // we need to assign parent information.
    this.model.update<CollectionReference>(doc, domains.mixin.CollectionReference, {
      _parentClass: tx._objectClass,
      _parentId: tx._objectId,
      _collection: tx._collection,
      _parentSpace: tx._objectSpace
    })

    // doc._parentId
    await this.collection(tx._objectClass).insertOne(doc)
  }

  createFilter (tx: ItemTx): FilterQuery<Emb> {
    const filter: FilterQuery<Emb> = this.model.assign({}, domains.mixin.CollectionReference, {
      _parentId: tx._objectId,
      _parentClass: tx._objectClass,
      _collection: tx._collection,
      _id: tx._itemId,
      _class: tx._itemClass
    })

    if (tx._objectSpace !== undefined) {
      this.model.assign(filter, domains.mixin.CollectionReference, {
        _parentSpace: tx._objectSpace
      })
    }
    return filter
  }

  async onUpdateItemTx (ctx: TxContext, tx: UpdateItemTx): Promise<any> {
    const assignValue = this.model.assign({}, tx._itemClass, tx.attributes)
    delete (assignValue._class)
    return await this.collection(tx._objectClass).updateOne(this.createFilter(tx), { $set: assignValue })
  }

  async onRemoveItemTx (ctx: TxContext, tx: RemoveItemTx): Promise<any> {
    return await this.collection(tx._objectClass).deleteOne(this.createFilter(tx))
  }

  async findMongo<T extends Obj>(_class: Ref<Class<Doc>>, mongoQuery: FilterQuery<T>, options?: FindOptions<T>): Promise<T[]> {
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
        const sortOptions: AnyLayout = (options.sort ?? {}) as unknown as AnyLayout
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
      const sortOptions: AnyLayout = (options.sort ?? {}) as unknown as AnyLayout
      cursor = cursor.sort(sortOptions as SortOptionObject<Doc>)
    }

    const values = await cursor.toArray()
    // Notify callback about counts.
    if (options?.countCallback !== undefined) {
      options.countCallback(0, 0, values.length)
    }
    return values
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const mongoQuery = toMongoQuery(this.model, _class, query)
    return await this.findMongo(_class, mongoQuery, options)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const mongoQuery = toMongoQuery(this.model, _class, query)

    const result = await this.collection(_class).findOne<T>(mongoQuery)
    if (result === null) {
      return undefined
    }
    return result
  }

  async findIn <T extends Doc, C extends Emb>(_class: Ref<Class<T>>, _id: Ref<Doc>, _collectionIdB: CollectionId<T>, _itemClass: Ref<Class<C>>, query: DocumentQuery<C>, options?: FindOptions<C>): Promise<C[]> {
    const _collectionId = _collectionIdB(collectionId<T>())

    const attr = this.model.classAttribute(_class, _collectionId)
    const attrClass = (attr.attr.type as CollectionOf<Emb>).of

    if (attrClass === undefined) {
      throw new Error('attribute class is not defined')
    }
    if (!this.model.is(_itemClass, attrClass)) {
      throw new Error(`incompatible item class specified ${_itemClass} ${attrClass}`)
    }

    const equery = toMongoQuery(this.model, _itemClass, query)

    return await this.findMongo<C>(_class/** mongo collection uses */, equery, options)
  }
}
