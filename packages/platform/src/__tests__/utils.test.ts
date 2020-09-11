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

/* eslint-env jest */

import { TxProcessor, Index } from '../utils'
import { MemDb } from '../memdb'
import { CreateTx, PushTx, core, UpdateTx, DeleteTx, Tx, Class, Ref } from '../core'

describe('utils', () => {
  const memdb = new MemDb('testdomain')

  class TestIndex implements Index {
    isCalled = false
    expectedClass: Ref<Class<Tx>>
    expectedArgument: Tx
    returnValue: any

    constructor (expectedArgument: Tx, returnValue: any) {
      this.expectedClass = expectedArgument._class as Ref<Class<Tx>>
      this.expectedArgument = expectedArgument
      this.returnValue = returnValue
    }

    private checkCall (tx : Tx): Promise<any> {
      expect(this.isCalled).toBe(false)
      this.isCalled = true
      expect(tx).toBe(this.expectedArgument)
      return Promise.resolve(this.returnValue)
    }

    onCreate (create: CreateTx): Promise<any> {
      expect(this.expectedClass).toBe(core.class.CreateTx)
      return this.checkCall(create)
    }

    onPush (push: PushTx): Promise<any> {
      expect(this.expectedClass).toBe(core.class.PushTx)
      return this.checkCall(push)
    }

    onUpdate (update: UpdateTx): Promise<any> {
      expect(this.expectedClass).toBe(core.class.UpdateTx)
      return this.checkCall(update)
    }
  }

  function checkTxProcessing (tx : Tx, valueForIndex1: any, valueForIndex2: any) {
    const index1 = new TestIndex(tx, valueForIndex1)
    const index2 = new TestIndex(tx, valueForIndex2)
    const txProcessor = new TxProcessor(memdb, [index1, index2])

    const processPromise = txProcessor.process(tx)
    expect(processPromise).toBeInstanceOf(Promise)

    return processPromise.then(res => {
      expect(index1.isCalled).toBe(true)
      expect(index2.isCalled).toBe(true)
      expect(res).toEqual([valueForIndex1, valueForIndex2])
    })
  }

  it('should process CreateTx', () => {
    const createTx = { _class: core.class.CreateTx } as unknown as CreateTx
    return checkTxProcessing(createTx, 'value1', 'value2')
  })

  it('should process PushTx', () => {
    const pushTx = { _class: core.class.PushTx } as unknown as PushTx
    return checkTxProcessing(pushTx, true, 10)
  })

  it('should process UpdateTx', () => {
    const updateTx = { _class: core.class.UpdateTx } as unknown as UpdateTx
    return checkTxProcessing(updateTx, undefined, undefined)
  })

  it('should fail to process DeleteTx', () => {
    const updateTx = { _class: core.class.DeleteTx } as unknown as DeleteTx
    const txProcessor = new TxProcessor(memdb, [])
    expect(() => txProcessor.process(updateTx)).toThrowError('not implemented (apply tx)')
  })

  it('should fail to process unknown Tx', () => {
    const tx = { _class: 'class:core.Tx' } as Tx
    const txProcessor = new TxProcessor(memdb, [])
    expect(() => txProcessor.process(tx)).toThrowError('not implemented (apply tx)')
  })
})
