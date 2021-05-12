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
import { newClient, ClientService } from '@anticrm/client'
import { LoginInfo } from '@anticrm/login'
import contact from '@anticrm/contact/src/__model__'
import { newCreateTx } from '@anticrm/domains/src/tx/tx'
import { DateProperty, generateId, Ref, StringProperty } from '@anticrm/core'
import { Application, CORE_CLASS_SPACE, CORE_CLASS_SPACE_USER, Space } from '@anticrm/domains'
import chunter, { Comment, Message } from '@anticrm/chunter'
import { generateToken } from '@anticrm/accounts/src/token'
import { generateRandomBigInt } from 'telegram/Helpers'
import { Person } from '@anticrm/contact'

const credentials = {
  apiId: parseInt(process.env.TELEGRAM_API_ID ?? ''),
  apiHash: process.env.TELEGRAM_API_HASH ?? ''
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

  private async eventPrint (event: NewMessageEvent): Promise<void> {
    if (event.isPrivate === true) {
      await this.savePrivateMessage(event)
    }
  }

  async stop (): Promise<void> {
    // eslint-disable-next-line no-void
    void this.integrator.disconnect()
  }

  async start (): Promise<void> {
    const platformToken = generateToken(this.user, serverConfig.workspaceName)
    this.platformClient = await newClient(platformToken, serverConfig.platformServerAddress, serverConfig.platformServerPort)
    await this.integrator.connect()
    instances.push(this)
    this.integrator.addEventHandler(async (event: NewMessageEvent) => await this.eventPrint(event), new NewMessage({}))
  }

  async logOut (): Promise<void> {
    instances = instances.filter((instance) => instance.user !== this.user)
    await this.integrator.invoke(new Api.auth.LogOut()).catch(() => {})
    await this.integrator.disconnect()
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

  private async savePrivateMessage (event: NewMessageEvent): Promise<void> {
    if (this.platformClient === undefined) return
    await event.getChat()
    const message = event.message as Api.Message
    if (message.out === true || message.message.length === 0) return
    let contactSpace = await this.platformClient.findOne(CORE_CLASS_SPACE, { isPublic: false, name: this.user + ' telegram contacts', application: 'application:contact.Contact' as Ref<Application> })
    if (contactSpace === undefined) {
      contactSpace = {
        _id: generateId(),
        _class: CORE_CLASS_SPACE,
        name: this.user + ' telegram contacts',
        description: this.user + ' telegram contacts',
        application: 'application:contact.Contact' as Ref<Application>, // todo
        spaceKey: this.user + 'TELEGRAM_CONTACTS',
        archived: false,
        users: [{ _class: CORE_CLASS_SPACE_USER, userId: this.user, owner: true }],
        isPublic: false
      }

      await this.platformClient.tx(newCreateTx(
        contactSpace,
        this.user
      ))
    }

    const senderUser = (await this.integrator.getEntity(event.chatId)) as Api.User
    let person: Person | undefined
    if (senderUser.username !== null) {
      person = await this.platformClient.findOne(contact.class.Person, { telegramUserName: senderUser.username, _space: contactSpace._id as Ref<Space> })
    }
    if (person === undefined) {
      person = await this.platformClient.findOne(contact.class.Person, { phone: senderUser.phone, _space: contactSpace._id as Ref<Space> })
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

      await this.platformClient.tx(newCreateTx(
        person,
        this.user as StringProperty,
        contactSpace._id as Ref<Space>
      ))
    }

    let messageSpace = await this.platformClient.findOne(CORE_CLASS_SPACE, { isPublic: false, application: 'application:chunter.Chat' as Ref<Application>, spaceKey: 'Telegram_' + person._id })
    if (messageSpace === undefined) {
      messageSpace = {
        _id: generateId(),
        _class: CORE_CLASS_SPACE,
        name: person.name,
        description: `private ${this.user} to ${person.name} telegram chat`,
        application: 'application:chunter.Chat' as Ref<Application>,
        spaceKey: 'Telegram_' + person._id,
        archived: false,
        users: [{ _class: CORE_CLASS_SPACE_USER, userId: this.user, owner: true }],
        isPublic: false
      }

      await this.platformClient.tx(newCreateTx(
        messageSpace,
        this.user
      ))
    }

    const comment: Comment = {
      _class: chunter.class.Comment,
      _createdOn: (message.date * 1000) as DateProperty,
      _createdBy: person.name as StringProperty,
      message: message.message
    }
    const msg: Message = {
      _id: generateId(),
      _class: chunter.class.Message,
      comments: [comment],
      _space: messageSpace._id as Ref<Space>,
      _createdOn: (message.date * 1000) as DateProperty,
      _createdBy: person.name as StringProperty
    }
    await this.platformClient.tx(newCreateTx(
      msg,
      this.user,
      messageSpace._id as Ref<Space>
    ))

    this.platformClient.close()
  }
}
