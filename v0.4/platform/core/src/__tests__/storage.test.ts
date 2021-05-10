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

import { describe, expect, it, jest } from '@jest/globals'
import { Class, CORE_CLASS_DOC, Doc, Ref } from '../classes'
import { Tx, TxContext, txContext, TxProcessor } from '../storage'

describe('storage', () => {
  describe('TxProcessor', () => {
    it('processes properly', async () => {
      const idxs = [
        {
          tx: jest.fn(async (_ctx: TxContext, _tx: Tx): Promise<number> => {
            return await Promise.resolve(1)
          })
        },
        {
          tx: jest.fn(async (_ctx: TxContext, _tx: Tx): Promise<number> => {
            return await Promise.resolve(2)
          })
        }
      ]
      const ctx = txContext()
      const tx = {
        _id: 'tx' as Ref<Class<Doc>>,
        _class: CORE_CLASS_DOC,
        _date: Date.now(),
        _user: 'user'
      }

      await new TxProcessor(idxs).process(ctx, tx)

      idxs.forEach(idx => {
        expect(idx.tx).toBeCalledTimes(1)
        expect(idx.tx).toBeCalledWith(ctx, tx)
      })
    })
  })
})
