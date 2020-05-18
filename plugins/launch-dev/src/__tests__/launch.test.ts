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

import { Platform, identify, Plugin, PluginId } from '@anticrm/platform'
import db from '@anticrm/platform-db'
import core from '@anticrm/platform-core'
import i18n from '@anticrm/platform-core-i18n'
import ui from '@anticrm/platform-ui-model'

import launch from '..'

describe('launch-dev', () => {

  const platform = new Platform()
  platform.addLocation(db, () => import('@anticrm/platform-db/src/memdb'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(i18n, () => import('@anticrm/platform-core-i18n/src/plugin'))
  platform.addLocation(ui, () => import('@anticrm/platform-ui/src/plugin'))
  platform.addLocation(launch, () => import('../launch'))

  platform.setResolver('native', core.id)

  it('should load classes into memdb', async () => {
    const launchPlugin = await platform.getPlugin(launch.id)
    const dump = launchPlugin.db.dump()
    console.log(dump)

    console.log(JSON.stringify(dump))

    expect(true).toBe(true)
  })
})
