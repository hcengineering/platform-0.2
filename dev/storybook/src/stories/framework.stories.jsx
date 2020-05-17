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

import Theme from '../components/Theme.vue'

import ui from '@anticrm/platform-ui'

import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import PropPanel from '@anticrm/platform-ui/src/components/PropPanel.vue'
import ObjectPanel from '@anticrm/platform-ui/src/components/ObjectPanel.vue'
import Table from '@anticrm/platform-ui/src/components/Table.vue'

import core from '@anticrm/platform-core'

import contact from '@anticrm/contact'

import { getSession } from '..'

export default {
  title: 'Framework'
}

export const icon = () => ({
  render() {
    return <Theme>
      <Icon icon={ui.icon.Add} class="icon-embed" />
      <Icon icon={ui.icon.AddGroup} class="icon-embed" />
      <br/>
      Default: <Icon class="icon-embed"/>
    </Theme>
  }
})

const contactInstance = getSession().then(session => {
  return session.getClass(contact.class.Contact).then(clazz => {
    return clazz.newInstance({ email: 'xxx@gmail.com' })
  })
})

const props = ['phone', 'email']

export const properties = () => ({
  render() {
    return <Theme><PropPanel clazz={contact.class.Contact} object={contactInstance}></PropPanel></Theme>
  }
})

// const personClass = session.getClass(contact.class.Person)
const personInstance = getSession().then(session => {
  return session.getClass(contact.class.Person).then(clazz => {
    return clazz.newInstance({ phone: '555 777 8888', firstName: 'John' })
  })
})

export const object = () => ({
  render() {
    return <Theme><ObjectPanel object={personInstance}></ObjectPanel></Theme>
  }
})


async function createTableConent() {
  const session = await getSession()
  const personClass = await session.getInstance(contact.class.Person)

  const person1 = await personClass.newInstance({})
  person1.firstName = 'Валентин Генрихович'
  person1.lastName = 'Либерзон'
  person1.email = 'lyberzone@gmail.com'

  const person2 = await personClass.newInstance({})
  person2.firstName = 'John'
  person2.lastName = 'Carmack'
  person2.email = 'carmack@acm.org'

  return [person1, person2]
}

export const table = () => ({
  render() {
    return <Theme><Table clazz={contact.class.Person} objects={createTableConent()}></Table></Theme>
  }
})
