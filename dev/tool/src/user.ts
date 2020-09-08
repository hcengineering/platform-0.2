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
import { UIBuilder } from '@anticrm/presentation-model'

import contact from '@anticrm/contact-model'
import { Person } from '@anticrm/contact'
import { Ref, Space, Property, generateId } from '@anticrm/platform'

export function createUser (builder: UIBuilder, db: Db, username: string) {

  const id = generateId() as Ref<Person>
  const user = builder.createDocument(contact.class.Person, {
    firstName: username,
    lastName: 'User',
    _space: undefined as unknown as Ref<Space>,
    _createdOn: Date.now() as Property<number, Date>,
    _createdBy: 'demo@user.com' as Property<string, string>,
  }, id)

  builder.mixinDocument(user, contact.mixin.User, {
    account: 'demo@user.com',
  })

  const model = builder.dumpAll()
  console.log(model.contact[0])

  return db.collection('contact').insertOne(model.contact[0])

}

export function removeUser (db: Db, username: string) {
  return db.collection('contact').deleteMany({ _mixins: contact.mixin.User })
}
