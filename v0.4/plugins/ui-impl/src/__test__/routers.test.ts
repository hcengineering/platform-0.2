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

/* eslint-env jest */

import { Router } from '../routes'
import { locationToUrl } from '../location'

interface MyProps {
  spaceId: string
  objId: string
  _class: string
}

interface ChildProps {
  docId: string
  filter: string
}

interface ParentProps {
  author: string
}

describe('routes', () => {
  it('match object value', () => {
    const r = new Router<MyProps>('/workbench/:spaceId/browse/:objId?_class')
    r.update({
      path: ['workbench', 'sp1', 'browse', 'obj1'],
      query: { _class: 'qwe' },
      fragment: ''
    })
    expect(r.match()).toBeTruthy()
    const pp = r.properties()

    expect(pp.objId).toEqual('obj1')
    expect(pp.spaceId).toEqual('sp1')
    expect(pp._class).toEqual('qwe')
  })

  it('match width default value', () => {
    const r = new Router<ParentProps>(':author', undefined, { author: 'qwe' })
    r.update({
      path: [],
      query: { _class: 'qwe' },
      fragment: ''
    })
    expect(r.match()).toBeTruthy()
    const pp = r.properties()

    expect(pp.author).toEqual('qwe')
  })

  it('test chained routers', () => {
    const r = new Router<MyProps>('/workbench/:spaceId/?_class')
    r.update({
      path: ['workbench', 'sp1', 'browse', 'GEN-1'],
      query: { _class: 'qwe', data: 'azs', filter: 'fff' },
      fragment: ''
    })
    expect(r.match()).toBeTruthy()

    const child = r.newRouter<ChildProps>('/browse/:docId?filter')
    expect(child.match()).toBeTruthy()

    const pp = child.properties()

    expect(pp.docId).toEqual('GEN-1')
    expect(pp.filter).toEqual('fff')
  })

  it('test navigate', () => {
    const r1 = new Router<ParentProps>('/author/:author')
    const r2 = r1.newRouter<MyProps>('/workbench/:spaceId/?_class')
    const r3 = r2.newRouter<ChildProps>('/browse/:docId/?filter')
    r1.update({
      path: ['author', 'master', 'workbench', 'sp1', 'browse', 'GEN-1'],
      query: { _class: 'qwe', data: 'azs', filter: 'fff' },
      fragment: ''
    })
    const nl1 = r1.location({ author: 'qwe' })
    const nl2 = r2.location({ spaceId: 'zzz' })
    const nl3 = r3.location({ filter: 'teta' })
    expect(locationToUrl(nl1)).toEqual('/author/qwe/workbench/sp1/browse/GEN-1?_class=qwe&filter=fff')
    expect(locationToUrl(nl2)).toEqual('/author/master/workbench/zzz/browse/GEN-1?_class=qwe&filter=fff')
    expect(locationToUrl(nl3)).toEqual('/author/master/workbench/sp1/browse/GEN-1?_class=qwe&filter=teta')
  })
})
