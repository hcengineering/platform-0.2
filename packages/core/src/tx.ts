//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Doc, StringProperty, Ref, Class, AnyLayout, DateProperty } from './classes'

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

export interface Storage {
  store (ctx: TxContext, doc: Doc): Promise<void>
  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void>
  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attributes: AnyLayout): Promise<void>
  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null): Promise<void>

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
}

export const TX_DOMAIN = 'tx'

export interface ObjectTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
}
export interface CreateTx extends ObjectTx {
  object: AnyLayout
}

export interface PushTx extends ObjectTx {
  _attribute: StringProperty
  _attributes: AnyLayout
  _query?: AnyLayout
}

export interface UpdateTx extends ObjectTx {
  _attributes: AnyLayout
  _query?: AnyLayout
}

export interface DeleteTx extends ObjectTx {
  _query?: unknown
}

export class TxIndex implements DomainIndex {
  private storage: Storage

  constructor (storage: Storage) {
    this.storage = storage
  }

  tx (ctx: TxContext, tx: Tx): Promise<any> {
    return this.storage.store(ctx, tx)
  }
}

///

export interface DocumentProtocol {
  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
  loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]>
}

export interface CoreProtocol extends DocumentProtocol {
  tx (tx: Tx): Promise<any>
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
