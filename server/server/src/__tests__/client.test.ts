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

import { generateToken } from '@anticrm/accounts/src/token'
import chunter, { Comment, Message } from '@anticrm/chunter'
import { ClientService, newClient } from '@anticrm/client'
import { DateProperty, generateId, Property, Ref, StringProperty } from '@anticrm/core'
import { Application, CORE_CLASS_SPACE, CORE_CLASS_SPACE_USER, Space } from '@anticrm/domains'
import { newCreateTx } from '@anticrm/domains/src/tx/tx'
import { ServerSuite } from './serversuite'

jest.mock('../webrtc')

describe('service', () => {
  const wsName = 'test-service-client'
  const server = new ServerSuite(wsName)
  let client: ClientService | undefined

  beforeAll(async () => {
    await server.start()
  })

  afterAll(async () => {
    await server.shutdown()
  })
  beforeEach(async () => {
    await server.reInitDB()
  })
  afterEach(async () => {
    if (client !== undefined) {
      client.close()
    }
  })

  it('create a chunter page with tx', async () => {
    // Take address from running server
    const addr = server.address()

    // Take a working token.
    const token = generateToken('vasya', wsName)

    client = await newClient(token, addr.address, addr.port)

    // Create a chunter message in a first chunter space.
    const spaces = await client.find(CORE_CLASS_SPACE, {
      isPublic: true as Property<boolean, boolean>,
      application: 'application:chunter.Chat' as Ref<Application>
    })
    expect(spaces.length).toEqual(2)

    // User need to be inside a space to be able to add messages into it.
    // Let's create a new private space and add mesages into it

    const messageSpace: Space = {
      _id: generateId(),
      _class: CORE_CLASS_SPACE,
      name: 'private-telegram-space',
      description: 'pribate vasya to telegram chat',
      application: 'application:chunter.Chat' as Ref<Application>,
      spaceKey: 'TELEGRAM-1001001',
      archived: false,
      users: [{ _class: CORE_CLASS_SPACE_USER, userId: 'vasya', owner: true }],
      isPublic: false
    }
    const messageSpaceId = messageSpace._id as Ref<Space>
    await client.tx(newCreateTx(
      messageSpace,
      'vasya' as StringProperty
    ))

    // Check if we have some messages already

    let msgs = await client.find(chunter.class.Message, { _space: messageSpaceId })
    expect(msgs.length).toEqual(0)

    // Create a comment object.
    const c0: Comment = {
      _class: chunter.class.Comment,
      _createdOn: Date.now() as DateProperty,
      _createdBy: 'vasya' as StringProperty,
      message: 'Hi Peter it is vasya (telegram)'
    }
    const msg: Message = {
      _id: generateId(),
      _class: chunter.class.Message,
      comments: [c0],
      _space: messageSpaceId,
      _createdOn: Date.now() as DateProperty,
      _createdBy: 'vasya' as StringProperty
    }
    await client.tx(newCreateTx(
      msg,
      'vasya',
      messageSpaceId
    ))

    msgs = await client.find(chunter.class.Message, { _space: messageSpaceId })
    expect(msgs.length).toEqual(1)
    client.close()
  })
})
