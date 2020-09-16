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
import { User } from '@anticrm/contact'
import { builder } from '@anticrm/boot/src/boot'

import contact from '@anticrm/contact/src/__model__'
import { Person } from '@anticrm/contact'
import { Ref, Space, Property, generateId } from '@anticrm/core'

export function createUser (db: Db, email: string, username: string) {

  const id = generateId() as Ref<Person>
  const user = builder.createDocument(contact.class.Person, {
    name: username,
    _space: undefined as unknown as Ref<Space>,
    _createdOn: Date.now() as Property<number, Date>,
    _createdBy: 'system' as Property<string, string>,
  }, id)

  builder.mixinDocument(user, contact.mixin.User, {
    account: email,
  })

  const model = builder.dumpAll()
  console.log(model.contact[0])

  return db.collection('contact').insertOne(model.contact[0])

}

export function removeUser (db: Db, username: string) {
  return db.collection('contact').deleteMany({ _mixins: contact.mixin.User })
}
