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

// S E T  M E T A D A T A

import uiMeta from '@anticrm/platform-ui/src/__resources__/meta'
platform.loadMeta(uiMeta)

// S T A R T  C O R E  P L U G I N

import core from '@anticrm/platform-core'
import startCore from '@anticrm/platform-core/src/plugin'

const corePlugin = startCore(platform)
const session = corePlugin.getSession()
platform.setPlugin(core.id, corePlugin)

// B U I L D  M O D E L S

// Core
import { metaModel } from '@anticrm/platform-core/src/__resources__/model'
session.loadModel(metaModel)

// UI 
import uiModel from '@anticrm/platform-ui/src/__resources__/model'
import { Builder as CoreBuilder } from '@anticrm/platform-core/src/__resources__/builder'
uiModel(new CoreBuilder(session))

// Contact
import contactCoreModel from '@anticrm/contact/src/__resources__/model'
import { Builder as UIBuilder } from '@anticrm/platform-ui/src/__resources__/builder'
contactCoreModel(new UIBuilder(session))

// Test
import { Ref } from '@anticrm/platform-core'
import contactCore, { Contact } from '@anticrm/contact'

export const contact1 = 'test.contact.1' as Ref<Contact>

const contactClass = session.getClass(contactCore.class.Contact)
contactClass.newInstance({
  _id: contact1,
  phone: '+7 913 333 5555'
})

// S T A R T  U I  P L U G I N

import ui from '@anticrm/platform-ui'
import startUI from '@anticrm/platform-ui/src/plugin'

const uiPlugin = startUI(platform)
platform.setPlugin(ui.id, uiPlugin)

// D U M P

// console.log(session.dump())
// console.log(JSON.stringify(session.dump(), null, 2))
