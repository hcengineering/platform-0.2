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

import { identify, Plugin, Service } from '@anticrm/platform'
import { Ref, Class, Doc, Obj } from '@anticrm/platform'
import { MemDb, DbProtocol, ClassClass } from '..'
import { createCache, CacheControl } from '../indexeddb'

require("fake-indexeddb/auto")

describe('core', () => {

  const modeldb = new MemDb()
  let cache: DbProtocol & CacheControl

  const test = identify('test' as Plugin<Service>, {
    class: {
      A1: '' as Ref<Class<Doc>>,
      A2: '' as Ref<Class<Doc>>,
      B1: '' as Ref<Class<Doc>>,
      B2: '' as Ref<Class<Doc>>,
    }
  })

  it('should load model', () => {
    modeldb.loadModel([
      {
        _class: ClassClass,
        _id: ClassClass,
        _domain: 'model'
      },
      {
        _class: ClassClass,
        _id: test.class.A1,
        _domain: 'domainA'
      },
      {
        _class: ClassClass,
        _id: test.class.A2,
        _domain: 'domainA'
      },
      {
        _class: ClassClass,
        _id: test.class.B1,
        _domain: 'domainB'
      },
      {
        _class: ClassClass,
        _id: test.class.B2,
        _domain: 'domainB'
      },
    ])
  })

  it('should create cache', async () => {
    cache = await createCache('testdb', modeldb)

    const result = await cache.find(test.class.A1, {})
    expect(result.length).toBe(0)

    const all = await modeldb.find(ClassClass, {})
    expect(all.length).toBe(5)

    await cache.cache(all)

    const classes = await cache.find(ClassClass, {})
    expect(classes.length).toBe(5)
  })
})
