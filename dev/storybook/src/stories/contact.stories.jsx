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

import Vue from 'vue'
import Theme from '../components/Theme.vue'

import platform from '..'
import core from '@anticrm/platform-core'
import contact from '@anticrm/contact'

import ContactForm from '@anticrm/contact/src/components/ContactForm.vue'

export default {
  title: 'Contact'
}

async function createPerson() {
  const corePlugin = await platform.getPlugin(core.id)
  const session = corePlugin.getSession()
  const personClass = await session.getInstance(contact.class.Person)
  return personClass.newInstance({ phone: '555 777 8888', firstName: 'John' })
}

export const form = () => ({
  render() {
    return <Theme><ContactForm object={createPerson()}/></Theme>
  }
})
