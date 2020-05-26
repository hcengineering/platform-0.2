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

import { Platform } from '@anticrm/platform'
import { Db } from '@anticrm/platform-db'
import { Class, CoreService, Doc, Ref } from '@anticrm/platform-core'
import { Query } from '@anticrm/platform-ui-model'

import { LaunchPlugin } from '..'

// import { metaModel } from '@anticrm/platform-core/src/__resources__/model'

// import CoreBuilder from '@anticrm/platform-core/src/__resources__/builder'
// import UIBuilder from '@anticrm/platform-ui-model/src/__resources__/builder'

// import i18nModel from '@anticrm/platform-core-i18n/src/__resources__/model'
// import uiModel from '@anticrm/platform-ui-model/src/__resources__/model'
import contactModel from '@anticrm/contact/src/__resources__/model'

import ui from '@anticrm/platform-ui-model/src/__resources__'
import contact from '@anticrm/contact/src/__resources__'


export default async (platform: Platform, deps: {
  core: CorePlugin,
  db: Db,
  // ui: UIPlugin 
}): Promise<LaunchPlugin> => {
  console.log('Plugin `launch-dev` started')

  const db = deps.db
  db.load(metaModel)

  const session = deps.core.getSession()

  const coreBuilder = new CoreBuilder(session)
  await coreBuilder.build(i18nModel)
  await coreBuilder.build(uiModel)

  const uiBuilder = new UIBuilder(session)
  await uiBuilder.build(contactModel)

  const B = coreBuilder

  const queryClass = await B.getClass(ui.class.Query)
  const clientQuery = queryClass.newInstance({
    _id: 'xxxxx' as Ref<Query<Doc>>,
    clazz: contact.class.Person,
    exclude: [],
    order: []
  })

  return {
    db,
    // ui: deps.ui,
    session: deps.core.getSession()
  }
}

console.log('Plugin `launch-dev` parsed')