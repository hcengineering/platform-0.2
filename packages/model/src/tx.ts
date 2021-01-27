import { DateProperty, Doc, StringProperty } from './classes'

/**
 * Transaction operation being processed.
 */
export interface Tx extends Doc {
  _date: DateProperty
  _user: StringProperty
}

/**
 * Operation direction, is it came from server or it is own operation.
 */
export enum TxContextSource {
  Client, Server
}

/**
 * Define a transaction processing context.
 */
export interface TxContext {
  // Define a network operations if required.
  network: Promise<void>
  // Define transaction source
  source: TxContextSource
}

/**
 * Return a complete TxContext
 */
export function txContext (source: TxContextSource = TxContextSource.Client, network: Promise<void> = Promise.resolve()): TxContext {
  return { network, source } as TxContext
}

export interface DomainIndex {
  tx (ctx: TxContext, tx: Tx): Promise<any>
}
