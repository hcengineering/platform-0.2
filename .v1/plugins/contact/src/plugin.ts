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

import { Platform, Resource } from '@anticrm/platform'
import { Instance } from '@anticrm/platform-core'

import contact, { Person } from '.'
import ContactForm from './components/ContactForm.vue'

console.log('Plugin `contact` loaded')
/*!
 * Anticrm Platform™ Contact Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform) => {
  console.log('Plugin `contact` started')

  function getText (this: Instance<Person>): string {
    return this.firstName + ' ' + this.lastName
  }

  function getImage (this: Instance<Person>): Resource<string> {
    return 'xyz' as Resource<string>
  }

  platform.setResource(contact.method.Person_getText, getText)
  platform.setResource(contact.method.Person_getImage, getImage)

  platform.setResource(contact.form.Person, ContactForm)

  return {}
}