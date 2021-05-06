//
// Copyright © 2021 Anticrm Platform Contributors.
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

import { FindOptions, SortingOrder } from '../storage'
import { Task } from './tasks'

/* eslint-env jest */

describe('search', () => {
  describe('Search Options', () => {
    it('search order', async () => {
      let options: FindOptions<Task> = { sort: { _id: SortingOrder.Ascending, name: SortingOrder.Descending } }
      console.log(JSON.stringify(options))

      options = { sort: { name: SortingOrder.Descending, _id: SortingOrder.Ascending } }
      console.log(JSON.stringify(options))
    })
  })
})
