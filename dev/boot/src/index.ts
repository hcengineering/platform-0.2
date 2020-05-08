//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import platform from '@anticrm/platform'

import { pluginId as corePluginId } from '@anticrm/platform-core'
import startCore from '@anticrm/platform-core/src/plugin'

import { pluginId as uiPluginId } from '@anticrm/platform-ui'
import startUI from '@anticrm/platform-ui/src/plugin'


import coreModel from '@anticrm/platform-core/src/__model__'
import contactCoreModel from '@anticrm/contact-core/src/__model__'
import contactCore, { Contact } from '@anticrm/contact-core'

import { Ref } from '@anticrm/platform-core'

export const contact1 = 'test.contact.1' as Ref<Contact>

const corePlugin = startCore(platform)
const session = corePlugin.getSession()
platform.setPlugin(corePluginId, corePlugin)

session.loadModel(coreModel.model)
contactCoreModel.builder(session)

const contactClass = session.getClass(contactCore.class.Contact)
contactClass.newInstance({
  _id: contact1,
  phone: '+7 913 333 5555'
})

const uiPlugin = startUI(platform)
platform.setPlugin(uiPluginId, uiPlugin)
