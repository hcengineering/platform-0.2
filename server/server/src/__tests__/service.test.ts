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

import { ServerSuite } from './serversuite'
import chunter, { Page } from '@anticrm/chunter'

import { newCreateTx } from '@anticrm/client/src/tx'
import { Property, Ref, StringProperty } from '@anticrm/core'
import { CORE_CLASS_SPACE, Space, SpaceUser } from '@anticrm/domains'

describe('service', () => {
  const wsName = 'test-service'
  const server = new ServerSuite(wsName)

  beforeAll(async () => {
    await server.start()
  })

  afterAll(async () => {
    await server.shutdown()
  })
  beforeEach(async () => {
    await server.reInitDB()
  })

  it('should send query existing Spaces', async () => {
    const ws = server.getWorkspace(wsName)
    const { client } = (await server.newClients(1, ws))[0]

    const spaces = await client.find(CORE_CLASS_SPACE, { isPublic: true as Property<boolean, boolean> })
    expect(spaces.length).toEqual(3)
  })

  it('should not allow to create private space without owner', async () => {
    const ws = server.getWorkspace(wsName)
    const { client } = (await server.newClients(1, ws))[0]

    const spaces = await client.find(CORE_CLASS_SPACE, { isPublic: true as Property<boolean, boolean> })
    expect(spaces.length).toEqual(3)

    // Create a private space
    await client.tx(newCreateTx(
      {
        _class: CORE_CLASS_SPACE,
        name: 'private-space',
        users: [{ userId: 'test@client1' } as unknown as SpaceUser],
        isPublic: false
      } as unknown as Space,
      'test@client1' as StringProperty
    )).then(() => {
      expect(true).toEqual('show not complete sucessfully')
    }).catch((e) => {
      expect(e.message).toEqual('Space doesn\'t contain owner. Operation is not allowed')
    })
  })
  it('check public space', async () => {
    const ws = server.getWorkspace(wsName)

    const clients = (await server.newClients(2, ws))
    const c1 = clients[0].client
    const c2 = clients[1].client

    await c1.tx(newCreateTx(
      {
        _class: CORE_CLASS_SPACE,
        name: 'public-space',
        users: [{ userId: 'test@client2' }],
        isPublic: true
      } as unknown as Space,
      'test@client1' as StringProperty
    ))

    const spaces = await c1.find<Space>(CORE_CLASS_SPACE, { isPublic: true })

    expect(spaces.length).toEqual(4)
    await clients[1].wait()

    await c1.tx(newCreateTx(
      {
        _class: chunter.class.Page,
        title: 'public-space Page'
      } as unknown as Page,
      'test@client1' as StringProperty,
      spaces[0]._id as Ref<Space>
    ))

    let pages = await c1.find(chunter.class.Page, {})
    expect(pages.length).toEqual(0)

    pages = await c2.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1) // Only client 2 see a public page.
  })

  it('check private space', async () => {
    const ws = server.getWorkspace(wsName)

    const clients = (await server.newClients(2, ws))
    const c1 = clients[0].client
    const c2 = clients[1].client

    // Create a private space
    await c1.tx(newCreateTx(
      {
        _class: CORE_CLASS_SPACE,
        name: 'private-space',
        users: [{ userId: 'test@client1', owner: true } as unknown as SpaceUser],
        isPublic: false
      } as unknown as Space,
      'test@client1' as StringProperty
    ))
    let spaces = await c1.find(CORE_CLASS_SPACE, { isPublic: false as Property<boolean, boolean> })
    expect(spaces.length).toEqual(1)
    // Let's create task inside private space and check c2 is not recieve it.

    await c1.tx(newCreateTx(
      {
        _class: chunter.class.Page,
        title: 'private-space Page'
      } as unknown as Page,
      'test@client1' as StringProperty,
      spaces[0]._id as Ref<Space>
    ))
    let pages = await c1.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1)

    await clients[1].wait()

    // Client2 had access to client1 private-space, it should not.
    spaces = await c2.find(CORE_CLASS_SPACE, { isPublic: false as Property<boolean, boolean> })
    expect(spaces.length).toEqual(0)

    pages = await c2.find(chunter.class.Page, {})
    expect(pages.length).toEqual(0) // c2 is not allowed to see page from private space of c1
  })

  it('create-shared-space', async () => {
    const ws = server.getWorkspace(wsName)

    const clients = (await server.newClients(2, ws))
    const c1 = clients[0].client
    const c2 = clients[1].client
    // Create a shared private space
    await c1.tx(newCreateTx(
      {
        _class: CORE_CLASS_SPACE,
        name: 'shared-space',
        users: [{ userId: 'test@client1', owner: true } as unknown as SpaceUser, {
          userId: 'test@client2',
          owner: false
        } as unknown as SpaceUser],
        isPublic: false
      } as unknown as Space,
      'test@client1' as StringProperty
    ))

    let spaces = await c1.find(CORE_CLASS_SPACE, { name: 'shared-space' as StringProperty })

    await c1.tx(newCreateTx(
      {
        _class: chunter.class.Page,
        title: 'shared-space Page'
      } as unknown as Page,
      'test@client1' as StringProperty,
      spaces[0]._id as Ref<Space>
    ))

    // Wait for all to be processed for c2
    await clients[1].wait()

    let pages = await c1.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1) // c2 is not allowed to see page from private space of c1

    pages = await c2.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1) // c2 is not allowed to see page from private space of c1

    // Client2 should have access to shared-space and recieve update about it.
    spaces = await c2.find(CORE_CLASS_SPACE, { isPublic: false as Property<boolean, boolean> })
    expect(spaces.length).toEqual(1)
  })
})
