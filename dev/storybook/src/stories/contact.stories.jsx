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

import ContactForm from '@anticrm/contact/src/components/ContactForm.vue'

import core from '@anticrm/platform-core'

import contact from '@anticrm/contact'

export default {
  title: 'Contact'
}

const corePlugin = platform.getPlugin(core.id)
const session = corePlugin.getSession()

const personClass = session.getClass(contact.class.Person)
const personInstance = personClass.newInstance({})

export const Form = () => ({
  render() {
    return <Theme><ContactForm object={personInstance}></ContactForm></Theme>
  }
})

