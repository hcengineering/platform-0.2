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
import { CorePlugin } from '@anticrm/platform-core'

import { LaunchPlugin } from '..'

import { metaModel } from '@anticrm/platform-core/src/__resources__/model'

import CoreBuilder from '@anticrm/platform-core/src/__resources__/builder'
import i18nModel from '@anticrm/platform-core-i18n/src/__resources__/model'

export default async (platform: Platform, deps: { core: CorePlugin, db: Db }): Promise<LaunchPlugin> => {
  const db = deps.db
  db.load(metaModel)

  const session = deps.core.getSession()

  const coreBuilder = new CoreBuilder(session)
  const i18n = await coreBuilder.build(i18nModel)

  return {
    db
  }
}