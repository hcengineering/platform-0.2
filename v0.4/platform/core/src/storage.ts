/**
 * Operation direction, is it came from server or it is own operation.
 */
import { Class, Doc, Emb, Obj, Ref } from './classes'
import { CollectionId } from './colletionid'

export enum TxContextSource {
  Client, // A pure client operation
  Server, // A pure server operation
  ServerTransient// A server restore state transaction
}

/**
 * Define a transaction processing context.
 */
export interface TxContext {
  // Define a network operations if required.
  network: Promise<void>
  // Define transaction source
  source: TxContextSource

  // A list of client only transactions
  clientTx: Tx[]
}

/**
 * Return a complete TxContext
 */
export function txContext (source: TxContextSource = TxContextSource.Client, network: Promise<void> = Promise.resolve()): TxContext {
  const doc: TxContext = {
    network,
    source,
    clientTx: []
  }
  return doc
}

export interface DomainIndex {
  tx: (ctx: TxContext, tx: Tx) => Promise<any>
}

export interface DocumentProtocol {
  /**
   * Search documents.
   */
  find: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>) => Promise<T[]>
  /**
   * Search collections in documents.
   */
  findIn: <T extends Doc, C extends Emb>(
    _class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>,
    _itemClass: Ref<Class<C>>, query: DocumentQuery<C>,
    options?: FindOptions<C>) => Promise<C[]>

  /**
   * Find one item.
   */
  findOne: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>) => Promise<T | undefined>
}

export interface DomainProtocol {
  /**
   * Load a bunch of document with domain.
   */
  loadDomain: (domain: string) => Promise<Doc[]>
}

/**
 * Define a storage with read/write access.
 */
export interface Storage extends DomainIndex, DocumentProtocol {
}

///
/**
 * Transaction operation being processed.
 */
export interface Tx extends Doc {
  _date: number
  _user: string
}

export interface RegExpression {
  $regex: string
  $options?: string
}

export type ObjQueryType<T> = T extends Obj ? never : T | RegExpression
export type ArrayQueryType<A> = A extends any[] ? A : ObjQueryType<A>

/**
 * A possible query values to be used with Document access protocol.
 *
 * It allows to pass individual values with matched type to T. In case of Arrays it is possible o match
 * entire array with partial fields or to match an element in array if object is specified as query.
 */
export type DocumentQuery<T> = {
  [P in keyof T]?: ArrayQueryType<T[P]>
}

// A possible values for document during creation.
export type TWithoutEmbArray<A> = A extends any[] ? A: A

export type DocumentValueRaw<T> = {
  [P in keyof T]: TWithoutEmbArray<T[P]>
}

type OmitPartial<T, P> = Omit<T, keyof P> & Partial<P>

type OmitObj<T, E extends Obj> = T extends E ? DocumentValueRaw<OmitPartial<T, E>> : never
/**
 * A values of T with some parts made partial, like _class, _id.
 */
export type DocumentValue<T> =
  OmitObj<T, Emb> | OmitObj<T, Doc> | OmitObj<T, Obj> | T

// Sorting structure
export enum SortingOrder {
  Ascending = 1,
  Descending = -1
}

export type TSortingWithoutEmbArray<A> = A extends any[] ? never: DocumentSorting<A>

export type DocumentSortingValueRaw<T> = {
  [P in keyof T]?: TSortingWithoutEmbArray<T[P]>
}
export type DocumentSorting<T> = T extends Obj ? DocumentSortingValueRaw<T> : SortingOrder

/**
 * Some options used to perform find opertion.
 */

export interface FindOptions<T> {
  /**
   * If set will limit a number of objects.
   * A limit value of 0 is equivalent to setting no limit.
  */
  limit?: number | undefined

  /**
   * Specify how many items we should skip in results.
   */
  skip?: number | undefined

  /**
   * Define a sorting, with a required order. All embedded object sortings are also available.
   * Please not order of passed fields will determine field ordering priority.
   */
  sort?: DocumentSorting<T> | undefined

  /**
   * A function to be notified about current query skip, limit and total.
   */
  countCallback?: (skip: number, limit: number, total: number) => void
}
// ************************************************************************************************************************************************************************************************

export interface CoreProtocol extends DocumentProtocol {
  /**
   * Process a transaction on server
   * @param tx
   */
  tx: (tx: Tx) => Promise<any>

  /**
   * Generate a sequence, short object reference.
   * @param domain - string domain identifier.
   * @return a generated reference Id,
   */
  genRefId: (domain: string) => Promise<Ref<Doc>>
}

export class TxProcessor {
  private readonly indices: DomainIndex[]

  constructor (indices: DomainIndex[]) {
    this.indices = indices
  }

  async process (ctx: TxContext, tx: Tx): Promise<any> {
    await Promise.all(this.indices.map(async index => {
      await index.tx(ctx, tx)
    }))
  }
}

/**
 * Perform model update and forward updates into chained storage if required.
 */
class CombineStorage implements Storage {
  private readonly storages: Storage[]

  constructor (storages: Storage[]) {
    this.storages = storages
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return (await Promise.all(this.storages.map(async (s) => await s.find(_class, query, options)))).reduce((p, c) => p.concat(c))
  }

  async findIn <T extends Doc, C extends Emb>(_class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>, _itemClass: Ref<Class<C>>, query: DocumentQuery<C>, options?: FindOptions<C>): Promise<C[]> {
    return (await Promise.all(this.storages.map(async (s) => await s.findIn(_class, _id, _collection, _itemClass, query, options)))).reduce((p, c) => p.concat(c))
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await Promise.race(this.storages.map(async (s) => {
      return await s.findOne(_class, query)
    }))
  }

  async tx (ctx: TxContext, tx: Tx): Promise<void> {
    await Promise.all(this.storages.map(async (s) => { await s.tx(ctx, tx) }))
  }
}

/**
 * Return a combined storage
 * @param storages
 */
export function combineStorage (...storages: Storage[]): Storage {
  return new CombineStorage(storages)
}
