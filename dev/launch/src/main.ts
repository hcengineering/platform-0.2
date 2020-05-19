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
// import db from '@anticrm/platform-db'
// import core from '@anticrm/platform-core'
// import i18n from '@anticrm/platform-core-i18n'
import ui from '@anticrm/platform-ui'
// import uiModel from '@anticrm/platform-ui-model'
import workbench from '@anticrm/platform-workbench'
// import launch from '@anticrm/launch-dev'

import { createApp } from 'vue'
import ErrorPage from './components/ErrorPage.vue'

// import uiMeta from '@anticrm/platform-ui-model/src/__resources__/meta'
// import contactMeta from '@anticrm/contact/src/__resources__/meta'

const platform = new Platform()
platform.setMetadata(ui.metadata.DefaultApplication, workbench.component.Workbench)

// platform.addLocation(db, () => import(/* webpackChunkName: "platform-db" */ '@anticrm/platform-db/src/memdb'))
// platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin'))
// platform.addLocation(i18n, () => import(/* webpackChunkName: "platform-core-i18n" */ '@anticrm/platform-core-i18n/src/plugin'))
platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin'))
// platform.addLocation(uiModel, () => import(/* webpackChunkName: "platform-ui-model" */ '@anticrm/platform-ui-model/src/plugin'))
platform.addLocation(workbench, () => import(/* webpackChunkName: "platform-workbench" */ '@anticrm/platform-workbench/src/plugin'))
// platform.addLocation(launch, () => import(/* webpackChunkName: "launch-dev" */ '@anticrm/launch-dev/src/launch'))

// uiMeta(platform)
// contactMeta(platform)

async function boot (): Promise<void> {
  const uiPlugin = await platform.getPlugin(ui.id)
  uiPlugin.getApp().mount('#app')
}

boot().catch(err => {
  createApp(ErrorPage).mount('#app')
})
