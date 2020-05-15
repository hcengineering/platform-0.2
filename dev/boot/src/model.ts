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

// B U I L D  M O D E L S

import core, { Session } from '@anticrm/platform-core'
import { metaModel } from '@anticrm/platform-core/src/__resources__/model'

import ui from '@anticrm/platform-ui'
import uiModel from '@anticrm/platform-ui/src/__resources__/model'
import { Builder as CoreBuilder } from '@anticrm/platform-core/src/__resources__/builder'

import contactCoreModel from '@anticrm/contact/src/__resources__/model'
import { Builder as UIBuilder } from '@anticrm/platform-ui/src/__resources__/builder'

import i18n from '@anticrm/platform-core-i18n'
import contactStrings from '@anticrm/contact/src/__resources__/strings/ru'

export async function loadModel(platform: Platform): Promise<[Session, void]> {
  await platform.getPlugin(ui.id)
  return Promise.all([
    platform.getPlugin(core.id).then(plugin => {
      const session = plugin.getSession()
      session.loadModel(metaModel)

      uiModel(new CoreBuilder(session))
      contactCoreModel(new UIBuilder(session))
      return session
    }),
    platform.getPlugin(i18n.id).then(plugin => {
      plugin.loadStrings(contactStrings)
    })])
}
