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

import { Db } from 'mongodb'
import { Model, Strings } from '@anticrm/boot/src/boot'
import { Doc } from '@anticrm/core'

export function initDatabase (db: Db) {
  const domains = { ...Model } as { [key: string]: Doc[] }
  const ops = [] as Promise<any>[]
  for (const domain in domains) {
    const model = domains[domain]
    db.collection(domain, (err, coll) => {
      ops.push(coll.deleteMany({}).then(() => model.length > 0 ? coll.insertMany(model) : null))
    })
  }
  return Promise.all(ops)
}
