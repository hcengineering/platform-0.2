/**
 * Operation direction, is it came from server or it is own operation.
 */
import { Class, DateProperty, Doc, Emb, Obj, Ref, StringProperty } from './classes'
import { Space, TxOperation, VDoc } from '@anticrm/domains'

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

export interface Storage {
  store: (ctx: TxContext, doc: Doc) => Promise<void>
  update: (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]) => Promise<void>
  remove: (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>) => Promise<void>

  find: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>) => Promise<T[]>
  findOne: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>) => Promise<T | undefined>
}

///
/**
 * Transaction operation being processed.
 */
export interface Tx extends Doc {
  _date: DateProperty
  _user: StringProperty
}

export interface DomainIndex {
  tx: (ctx: TxContext, tx: Tx) => Promise<any>
}

export interface RegExpression {
  $regex: string
  $options?: string
}

export type ObjQueryType<T> = T extends Obj ? DocumentQuery<T> : T | RegExpression
export type ArrayQueryType<A> = A extends Array<infer T> ? ObjQueryType<T> | Array<ObjQueryType<T>> : ObjQueryType<A>

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
export type TWithoutEmbArray<A> = A extends Array<infer T> ? Array<DocumentValue<T>>: DocumentValue<A>

export type DocumentValueRaw<T> = {
  [P in keyof T]: TWithoutEmbArray<T[P]>
}
export type DocumentValue<T> = T extends Doc ? DocumentValueRaw<Omit<T, keyof Doc>> : never | T extends Emb ? DocumentValueRaw<Omit<T, keyof Emb>>: never | T extends Obj ? T : T

export interface DocumentProtocol {
  find: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>) => Promise<T[]>
  findOne: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>) => Promise<T | undefined>
  loadDomain: (domain: string) => Promise<Doc[]>
}

export interface CoreProtocol extends DocumentProtocol {
  /**
   * Process a transaction on server
   * @param tx
   */
  tx: (tx: Tx) => Promise<any>

  /**
   * Generate a sequence, short object reference.
   * @param _space
   * @return a generated reference Id,
   */
  genRefId: (_space: Ref<Space>) => Promise<Ref<VDoc>>
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

///

function toHex (value: number, chars: number): string {
  const result = value.toString(16)
  if (result.length < chars) {
    return '0'.repeat(chars - result.length) + result
  }
  return result
}

let counter = Math.random() * (1 << 24) | 0
const random = toHex(Math.random() * (1 << 24) | 0, 6) + toHex(Math.random() * (1 << 16) | 0, 4)

function timestamp (): string {
  const time = (Date.now() / 1000) | 0
  return toHex(time, 8)
}

function count (): string {
  const val = counter++ & 0xffffff
  return toHex(val, 6)
}

export function generateId (): Ref<Doc> {
  return timestamp() + random + count() as Ref<Doc>
}

/**
 * Perform model update and forward updates into chained storage if required.
 */
class CombineStorage implements Storage {
  private readonly storages: Storage[]

  constructor (storages: Storage[]) {
    this.storages = storages
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T[]> {
    return (await Promise.all(this.storages.map(async (s) => await s.find(_class, query)))).reduce((p, c) => p.concat(c))
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await Promise.race(this.storages.map(async (s) => {
      return await s.findOne(_class, query)
    }))
  }

  async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    await Promise.all(this.storages.map(async (s) => {
      await s.remove(ctx, _class, _id)
    }))
  }

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    await Promise.all(this.storages.map(async (s) => { await s.store(ctx, doc) }))
  }

  async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<void> {
    await Promise.all(this.storages.map(async (s) => { await s.update(ctx, _class, _id, operations) }))
  }
}

/**
 * Return a combined storage
 * @param storages
 */
export function combineStorage (...storages: Storage[]): Storage {
  return new CombineStorage(storages)
}
