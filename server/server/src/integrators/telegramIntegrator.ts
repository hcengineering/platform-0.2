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

import { Api, TelegramClient } from 'telegram'
import { Logger } from 'telegram/extensions'
import { NewMessage, NewMessageEvent } from 'telegram/events/NewMessage'
import { StringSession } from 'telegram/sessions'
import { newClient, ClientService, EventType } from '@anticrm/client'
import { LoginInfo } from '@anticrm/login'
import contact from '@anticrm/contact/src/__model__'
import { newCreateTx } from '@anticrm/domains/src/tx/tx'
import { DateProperty, generateId, Ref, StringProperty, Tx } from '@anticrm/core'
import { Application, CORE_CLASS_CREATE_TX, CORE_CLASS_SPACE, CORE_CLASS_SPACE_USER, CreateTx, Space } from '@anticrm/domains'
import chunter, { Comment, Message } from '@anticrm/chunter'
import { generateToken } from '@anticrm/accounts/src/token'
import { generateRandomBigInt } from 'telegram/Helpers'
import { Person } from '@anticrm/contact'

const TELEGRAM_MESSAGE_SPACE_PREFIX = 'TELEGRAM_'
const TELEGRAM_CHAT_MESSAGE_SPACE_PREFIX = 'TELEGRAM_CHAT'

const credentials = {
  apiId: parseInt(process.env.TELEGRAM_API_ID ?? '5032962'),
  apiHash: process.env.TELEGRAM_API_HASH ?? 'd72399f4fcd2cc2a6ad3b86dfabb32e9'
}

const serverConfig = {
  workspaceName: 'workspace',
  platformServerAddress: '127.0.0.1',
  platformServerPort: 18080
}

let instances: TelegramIntegrator[] = []

Logger.setLevel('none') // no logging

export function setServerConfig (workspace: string, address: string, port: number): void {
  serverConfig.platformServerAddress = address
  serverConfig.platformServerPort = port
  serverConfig.workspaceName = workspace
}

export async function startTelegramClient (): Promise<void> {
  // todo get accounts with telegramToken
  const accounts: LoginInfo[] = []
  accounts.forEach(account => {
    instances.push(new TelegramIntegrator(account.email, account.telegramToken))
  })

  for (const instance of instances) {
    await instance.start()
  }
}

export async function stopTelegramClient (): Promise<void> {
  for (const instance of instances) {
    await instance.stop()
  }
  instances = []
}

export function getTelegramClient (user: string): TelegramIntegrator | undefined {
  return instances.find((instance) => instance.user === user)
}

export interface TelegramMessage {
  message: string
  receiver: string // can use username for non-contact and username, phone, id for contacts
}

export interface SignInRequest {
  client: string
  code: string
  hash: string
}

export class TelegramIntegrator {
  constructor (user: string, token?: string, testMode = false) {
    this.user = user
    this.stringSession = new StringSession(token)
    this.integrator = new TelegramClient(this.stringSession, credentials.apiId, credentials.apiHash, { connectionRetries: 5 })
    if (testMode) {
      this.integrator.session.setDC(2, '149.154.167.40', 80)
    }
  }

  readonly stringSession: StringSession

  readonly user: string

  private readonly integrator: TelegramClient

  private platformClient: ClientService | undefined

  async stop (): Promise<void> {
    this.platformClient?.close()
    await this.integrator.disconnect()
  }

  async start (): Promise<void> {
    const platformToken = generateToken(this.user, serverConfig.workspaceName)
    this.platformClient = await newClient(platformToken, serverConfig.platformServerAddress, serverConfig.platformServerPort)
    await this.integrator.connect()
    instances.push(this)
    this.integrator.addEventHandler(async (event: NewMessageEvent) => await this.eventHandler(event), new NewMessage({}))
    // eslint-disable-next-line no-void
    this.platformClient.addEventListener(EventType.Transaction, (event: unknown) => void this.platformEventHandler(event))
    await this.platformClient.generateId()
    console.log('telegram client started')
  }

  async logOut (): Promise<void> {
    instances = instances.filter((instance) => instance.user !== this.user)
    await this.integrator.invoke(new Api.auth.LogOut()).catch(() => {})
    await this.integrator.disconnect()
  }

  async sendGroupMessage (request: TelegramMessage): Promise<void> {
    const peerID = await this.integrator.getPeerId(new Api.PeerChat({
      chatId: parseInt(request.receiver)
    }))

    const enitity = await this.integrator.getEntity(new Api.PeerChat({
      chatId: peerID
    }))

    await this.integrator.sendMessage(enitity, {
      message: request.message
    })
  }

  async sendMessage (request: TelegramMessage): Promise<void> {
    const entity = await this.integrator.getEntity(request.receiver)
      .catch((error) => {
        console.log(error)
        throw new Error('Need add contact')
      })

    await this.integrator.sendMessage(entity, {
      message: request.message
    })
  }

  async addContact (phoneNumber: string, firstName: string, lastName: string): Promise<boolean> {
    const clientId = generateRandomBigInt()
    const result = await this.integrator.invoke(new Api.contacts.ImportContacts({
      contacts: [new Api.InputPhoneContact({
        phone: phoneNumber,
        firstName: firstName,
        lastName: lastName,
        clientId: clientId
      })]
    }))
    return result.imported.filter((contact) => contact.clientId === clientId).length > 0
  }

  async signIn (phoneNumber: string, code: string, phoneCodeHash: string): Promise<string | undefined> {
    const result = await this.integrator.invoke(new Api.auth.SignIn({
      phoneNumber: phoneNumber,
      phoneCodeHash: phoneCodeHash,
      phoneCode: code
    })).catch((error) => {
      if (error.message !== 'SESSION_PASSWORD_NEEDED') {
        throw error
      }
    })

    if (result === undefined) return undefined
    const token = this.stringSession.save()
    await this.start()
    return token
  }

  async signInWithPassword (phoneNumber: string, code: string, password: string): Promise<string | undefined> {
    await this.integrator.signInWithPassword(credentials, {
      phoneCode: async () => { return code },
      password: async () => { return password },
      phoneNumber: phoneNumber,
      onError: (error) => { console.log(error) }
    })

    const token = this.stringSession.save()
    await this.start()
    return token
  }

  async sendAuthCode (phoneNumber: string): Promise<string> {
    await this.integrator.connect()

    const result = await this.integrator.sendCode(credentials, phoneNumber)

    return result.phoneCodeHash
  }

  async getMe (): Promise<string> {
    const me = await this.integrator.getMe()
    return (me as Api.User).username ?? ''
  }

  private async eventHandler (event: NewMessageEvent): Promise<void> {
    await event.getChat()
    const message = event.message as Api.Message
    if (message.message.length === 0 || event.chatId === undefined) return
    if (event.isPrivate === true) {
      await this.savePrivateMessage(event.chatId, message)
    } else if (event.isGroup === true) {
      await this.saveGroupMessage(event.chatId, message)
    }
  }

  private async savePrivateMessage (chatId: number, message: Api.Message): Promise<void> {
    const contactSpace = await this.getContactSpace()

    const senderUser = (await this.integrator.getEntity(chatId)) as Api.User
    let person: Person | undefined
    if (senderUser.username !== null) {
      person = await this.platformClient?.findOne(contact.class.Person, { telegramUserName: senderUser.username, _space: contactSpace._id as Ref<Space> })
    }
    if (person === undefined) {
      person = await this.platformClient?.findOne(contact.class.Person, { phone: senderUser.phone, _space: contactSpace._id as Ref<Space> })
    }
    if (person === undefined) {
      person = {
        _id: generateId(),
        _class: contact.class.Person,
        _createdOn: Date.now() as DateProperty,
        _createdBy: this.user as StringProperty,
        _space: contactSpace._id as Ref<Space>,
        phone: senderUser.phone,
        name: `${senderUser.firstName ?? ''} ${senderUser.lastName ?? ''}`.trim(),
        telegramUserName: senderUser.username
      }

      await this.platformClient?.tx(newCreateTx(
        person,
        this.user as StringProperty,
        contactSpace._id as Ref<Space>
      ))
    }

    const messageSpace = await this.getMessageSpace(person._id, person.name)

    const sender = (message.out === true) ? this.user : person.name

    await this.saveMessage(message, sender, messageSpace._id as Ref<Space>)
  }

  private async getContactSpace (): Promise<Space> {
    let contactSpace = await this.platformClient?.findOne(CORE_CLASS_SPACE, { isPublic: false, name: this.user + ' telegram contacts', application: 'application:contact.Contact' as Ref<Application> })
    if (contactSpace === undefined) {
      contactSpace = {
        _id: generateId(),
        _class: CORE_CLASS_SPACE,
        name: this.user + ' telegram contacts',
        description: this.user + ' telegram contacts',
        application: 'application:contact.Contact' as Ref<Application>, // todo
        spaceKey: this.user + '_TELEGRAM_CONTACTS',
        archived: false,
        users: [{ _class: CORE_CLASS_SPACE_USER, userId: this.user, owner: true }],
        isPublic: false
      }

      await this.platformClient?.tx(newCreateTx(
        contactSpace,
        this.user
      ))
    }

    return contactSpace
  }

  private async saveGroupMessage (chatId: number, message: Api.Message): Promise<void> {
    const contactSpace = await this.getContactSpace()

    const chat = (await this.integrator.getEntity(chatId)) as Api.Chat
    const senderUser = (await this.integrator.getEntity(message.fromId)) as Api.User
    let person: Person | undefined

    if (senderUser.username !== null) {
      person = await this.platformClient?.findOne(contact.class.Person, { telegramUserName: senderUser.username, _space: contactSpace._id as Ref<Space> })
    }
    if (person === undefined) {
      person = await this.platformClient?.findOne(contact.class.Person, { phone: senderUser.phone, _space: contactSpace._id as Ref<Space> })
    }
    if (person === undefined) {
      person = {
        _id: generateId(),
        _class: contact.class.Person,
        _createdOn: Date.now() as DateProperty,
        _createdBy: this.user as StringProperty,
        _space: contactSpace._id as Ref<Space>,
        phone: senderUser.phone,
        name: `${senderUser.firstName ?? ''} ${senderUser.lastName ?? ''}`.trim(),
        telegramUserName: senderUser.username
      }

      await this.platformClient?.tx(newCreateTx(
        person,
        this.user as StringProperty,
        contactSpace._id as Ref<Space>
      ))
    }

    const messageSpace = await this.getMessageSpace('CHAT' + chatId.toString(), chat.title)

    const sender = (message.out === true) ? this.user : person.name

    await this.saveMessage(message, sender, messageSpace._id as Ref<Space>)
  }

  private async getMessageSpace (id: string, name: string): Promise<Space> {
    let messageSpace = await this.platformClient?.findOne(CORE_CLASS_SPACE, { isPublic: false, application: 'application:chunter.Chat' as Ref<Application>, spaceKey: TELEGRAM_MESSAGE_SPACE_PREFIX + id })
    if (messageSpace === undefined) {
      messageSpace = {
        _id: generateId(),
        _class: CORE_CLASS_SPACE,
        name: name,
        description: `private ${this.user} to ${name} telegram chat`,
        application: 'application:chunter.Chat' as Ref<Application>,
        spaceKey: TELEGRAM_MESSAGE_SPACE_PREFIX + id,
        archived: false,
        users: [{ _class: CORE_CLASS_SPACE_USER, userId: this.user, owner: true }],
        isPublic: false
      }

      await this.platformClient?.tx(newCreateTx(
        messageSpace,
        this.user
      ))
    }

    return messageSpace
  }

  private async saveMessage (message: Api.Message, sender: string, messageSpaceId: Ref<Space>): Promise<void> {
    const comment: Comment = {
      _class: chunter.class.Comment,
      _createdOn: (message.date * 1000) as DateProperty,
      _createdBy: sender as StringProperty,
      message: message.message
    }
    const msg: Message = {
      _id: generateId(),
      _class: chunter.class.Message,
      comments: [comment],
      _space: messageSpaceId,
      _createdOn: (message.date * 1000) as DateProperty,
      _createdBy: sender as StringProperty
    }

    await this.platformClient?.tx(newCreateTx(
      msg,
      this.user,
      messageSpaceId
    ))
  }

  private async platformEventHandler (platformEvent: unknown): Promise<void> {
    const tx = platformEvent as Tx
    if (tx._class !== CORE_CLASS_CREATE_TX) return
    const createTx = tx as CreateTx
    if (createTx._objectClass !== chunter.class.Message) return

    await this.createMessageHandler(createTx) // eslint-disable-line
  }

  private async createMessageHandler (createTx: CreateTx): Promise<void> {
    const message = await this.platformClient?.findOne(chunter.class.Message, { _id: createTx._objectId })
    if (message === undefined) return
    if (message.comments === undefined) return
    if (message._createdBy !== createTx._user) return
    const text = message.comments[0].message
    const messageSpace = await this.platformClient?.findOne(CORE_CLASS_SPACE, { _id: createTx._objectSpace })
    if (messageSpace === undefined) return
    if (!messageSpace.spaceKey.startsWith(TELEGRAM_MESSAGE_SPACE_PREFIX)) return
    if (messageSpace.spaceKey.startsWith(TELEGRAM_CHAT_MESSAGE_SPACE_PREFIX)) {
      const chatId = messageSpace.spaceKey.replace(TELEGRAM_CHAT_MESSAGE_SPACE_PREFIX, '')
      await this.sendGroupMessage({ message: text, receiver: chatId })
    } else {
      const contactSpace = await this.platformClient?.findOne(CORE_CLASS_SPACE, { isPublic: false, name: createTx._user + ' telegram contacts', application: 'application:contact.Contact' as Ref<Application> })
      if (contactSpace === undefined) return
      const receiverContact = await this.platformClient?.findOne(contact.class.Person, {
        _space: contactSpace._id as Ref<Space>,
        name: messageSpace.name
      })
      if (receiverContact === undefined) return
      const receiver = receiverContact.telegramUserName ?? receiverContact.phone
      if (receiver === undefined) return
      await this.sendMessage({ message: text, receiver: receiver })
    }
  }
}
