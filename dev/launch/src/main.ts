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

import core from '@anticrm/platform-core'
import i18n from '@anticrm/platform-core-i18n'
import ui from '@anticrm/platform-ui'
import uiComponents from '@anticrm/platform-ui-components'
import workbench from '@anticrm/platform-workbench'
import contact from '@anticrm/contact'
import demo from '@anticrm/demo-3d'
import mc from '@anticrm/app-mission-control'
import storybook from '@anticrm/app-storybook'

import { createApp } from 'vue'
import ErrorPage from './components/ErrorPage.vue'

// import uiMeta from '@anticrm/platform-ui-model/src/__resources__/meta'
import contactMeta from '@anticrm/contact/src/__model__/meta'
import contactRu from '@anticrm/contact/src/__model__/strings/ru'

import Builder from '@anticrm/platform-core/src/__model__/builder'

import coreModel from '@anticrm/platform-core/src/__model__/model'
import i18nModel from '@anticrm/platform-core-i18n/src/__model__/model'
import uiModel from '@anticrm/platform-ui/src/__model__/model'
import contactModel from '@anticrm/contact/src/__model__/model'

const builder = new Builder()
builder.load(coreModel)
builder.load(i18nModel)
builder.load(uiModel)
builder.load(contactModel)

const platform = new Platform()
platform.setMetadata(core.metadata.MetaModel, builder.dump())
platform.setMetadata(i18n.metadata.BootStrings, contactRu)
platform.setMetadata(ui.metadata.DefaultApplication, mc.component.MissionControl)
platform.setMetadata(mc.metadata.Applications, [
  workbench.component.Workbench,
  demo.component.Periodic,
  storybook.component.Storybook
])

platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin'))
platform.addLocation(i18n, () => import(/* webpackChunkName: "platform-core-i18n" */ '@anticrm/platform-core-i18n/src/plugin'))
platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin'))
platform.addLocation(uiComponents, () => import(/* webpackChunkName: "platform-ui-components" */ '@anticrm/platform-ui-components/src/plugin'))
platform.addLocation(workbench, () => import(/* webpackChunkName: "platform-workbench" */ '@anticrm/platform-workbench/src/plugin'))
platform.addLocation(contact, () => import(/* webpackChunkName: "contact" */ '@anticrm/contact/src/plugin'))
platform.addLocation(demo, () => import(/* webpackChunkName: "demo-3d" */ '@anticrm/demo-3d/src/plugin'))
platform.addLocation(mc, () => import(/* webpackChunkName: "mission-control" */ '@anticrm/app-mission-control/src/plugin'))
platform.addLocation(storybook, () => import(/* webpackChunkName: "storybook" */ '@anticrm/app-storybook/src/plugin'))

// uiMeta(platform)
contactMeta(platform)

async function boot (): Promise<void> {
  const i18nService = await platform.getPlugin(i18n.id) // TODO: dirty hack, resources does not resolve awhen building prototypes.
  const uiComponentsService = await platform.getPlugin(uiComponents.id)
  uiComponentsService.getApp().mount('#app')
}

boot().catch(err => {
  console.log(err)
  createApp(ErrorPage).mount('#app')
})
