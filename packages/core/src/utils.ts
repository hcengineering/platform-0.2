//
// Copyright © 2020 Anticrm Platform Contributors.
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

import { AnyLayout, Doc, Ref, Class, Tx, Index, Storage } from './core'

export interface CoreProtocol {
  find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]>
  findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined>
  tx (tx: Tx): Promise<void>
  loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]>
}

/**
 * Processor of incoming transactions.
 */
export class TxProcessor {
  private indices: Index[][] = []

  /**
   * Adds new bunch of indices to process a transaction.
   * All added bunches are run sequentially, in order, but indices inside every bunch process the transaction in parallel.
   *
   * @param indices the bunch of indicess for transaction processing
   * @returns the processor instance itself
   */
  add (indices: Index[]) {
    this.indices.push(indices)
    return this
  }

  /**
   * Processes the incoming transaction via stored bunches of indices.
   *
   * @param tx the transaction to process
   * @returns promise of array of transaction processing results
   */
  async process (tx: Tx): Promise<any> {
    const result: any[] = []
    for (const bunch of this.indices) {
      result.concat(await Promise.all(bunch.map(index => index.tx(tx))))
    }
    return result
  }
}
