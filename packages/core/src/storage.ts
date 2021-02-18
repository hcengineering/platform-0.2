/**
 * Operation direction, is it came from server or it is own operation.
 */
import { AnyLayout, Class, DateProperty, Doc, Ref, StringProperty } from './classes'
import { Space, VDoc } from '@anticrm/domains'

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
  return {
    network,
    source
  } as TxContext
}

export interface Storage {
  store (ctx: TxContext, doc: Doc): Promise<void>
  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void>
  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attributes: AnyLayout): Promise<void>
  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null): Promise<void>

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
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
  tx (ctx: TxContext, tx: Tx): Promise<any>
}

///

export interface DocumentProtocol {
  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
  loadDomain (domain: string): Promise<Doc[]>
}

export interface CoreProtocol extends DocumentProtocol {
  /**
   * Process a transaction on server
   * @param tx
   */
  tx (tx: Tx): Promise<any>

  /**
   * Generate a sequence, short object reference.
   * @param _space
   * @param _class
   * @return a generated reference Id,
   */
  genRefId (_space: Ref<Space>): Promise<Ref<VDoc>>
}

export class TxProcessor {
  private indices: DomainIndex[]

  constructor (indices: DomainIndex[]) {
    this.indices = indices
  }

  process (ctx: TxContext, tx: Tx): Promise<any> {
    return Promise.all(this.indices.map(index => index.tx(ctx, tx)))
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
