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

import chunter from '@anticrm/chunter'
import { Application, CORE_CLASS_SPACE, Space } from '@anticrm/domains'
import { DomainIndex, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import { CORE_CLASS_CREATE_TX, CreateTx } from '..'
import { getTelegramClient } from '@anticrm/server/src/integrators/telegramIntegrator'
import contact from '@anticrm/contact/src/__model__'

export class MessengerIndex implements DomainIndex {
  private readonly storage: Storage

  constructor (storage: Storage) {
    this.storage = storage
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    if (tx._class === CORE_CLASS_CREATE_TX) {
      return await this.onCreate(tx as CreateTx)
    }
  }

  async onCreate (create: CreateTx): Promise<void> {
    if (create._objectClass !== chunter.class.Message) return
    const message = await this.storage.findOne(chunter.class.Message, { _id: create._objectId })
    if (message === undefined) return
    if (message.comments === undefined) return
    if (message._createdBy !== message.comments[0]._createdBy) return
    const messageSpace = await this.storage.findOne(CORE_CLASS_SPACE, { _id: create._objectSpace })
    if (messageSpace === undefined) return
    if (!messageSpace.spaceKey.startsWith('Telegram_')) return
    const contactSpace = await this.storage.findOne(CORE_CLASS_SPACE, { isPublic: false, name: create._user + ' telegram contacts', application: 'application:contact.Contact' as Ref<Application> })
    if (contactSpace === undefined) return
    const receiverContact = await this.storage.findOne(contact.class.Person, {
      _space: contactSpace?._id as Ref<Space>,
      name: messageSpace.name
    })
    if (receiverContact === undefined) return

    const receiver = receiverContact.telegramUserName ?? receiverContact.phone
    if (receiver === undefined) return
    const instance = getTelegramClient(create._user)
    if (instance === undefined) return
    await instance.sendMessage({ message: message.comments[0].message, receiver: receiver })
  }
}
