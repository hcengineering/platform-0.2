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
import platform from '@anticrm/platform'

import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import PropPanel from '@anticrm/platform-ui/src/components/PropPanel.vue'
import ObjectPanel from '@anticrm/platform-ui/src/components/ObjectPanel.vue'
import Table from '@anticrm/platform-ui/src/components/Table.vue'

import core from '@anticrm/platform-core'

import contact from '@anticrm/contact'

export default {
  title: 'Framework'
}

export const icon = () => ({
  render() {
    return <Theme>
      <Icon icon={ui.icon.Add} class="icon-embed" />
      <Icon icon={ui.icon.AddGroup} class="icon-embed" />
    </Theme>
  }
})
const corePlugin = platform.getPlugin(core.id)
const session = corePlugin.getSession()

console.log('story session dump')
console.log(session.dump())

const contactClass = session.getClass(contact.class.Contact)
const contactInstance = contactClass.newInstance({})
const props = ['phone', 'email']

export const properties = () => ({
  render() {
    return <Theme><PropPanel clazz={contactClass} object={contactInstance}></PropPanel></Theme>
    //    return <Theme><PropPanel object={contactInstance} filter={props}></PropPanel></Theme>
  }
})

const personClass = session.getClass(contact.class.Person)
const personInstance = personClass.newInstance({})

export const object = () => ({
  render() {
    return <Theme><ObjectPanel object={personInstance}></ObjectPanel></Theme>
  }
})

const person1 = personClass.newInstance({})
person1.firstName = 'Валентин Генрихович'
person1.lastName = 'Либерзон'
person1.email = 'lyberzone@gmail.com'

const person2 = personClass.newInstance({})
person2.firstName = 'John'
person2.lastName = 'Carmack'
person2.email = 'carmack@acm.org'

const persons = [person1, person2]

export const table = () => ({
  render() {
    return <Theme><Table clazz={personClass} objects={persons}></Table></Theme>
  }
})
