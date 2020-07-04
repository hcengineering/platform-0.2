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
import rpc from '@anticrm/platform-rpc'
import i18n from '@anticrm/platform-core-i18n'
import ui from '@anticrm/platform-ui'
import presentationUi from '@anticrm/presentation-ui'
import business from '@anticrm/platform-business'
import vue, { VueService, LinkTarget } from '@anticrm/platform-vue'
import workbench from '@anticrm/platform-workbench'
import contact from '@anticrm/contact'
import chunter from '@anticrm/chunter'
import demo from '@anticrm/demo-3d'
import mc from '@anticrm/app-mission-control'
import storybook from '@anticrm/app-storybook'
import login, { setAccount, currentAccount, Account } from '@anticrm/platform-login'

import { createApp } from 'vue'
import ErrorPage from './components/ErrorPage.vue'

import uiMeta from '@anticrm/platform-vue/src/__meta__/meta'
import workbenchMeta from '@anticrm/platform-workbench/src/__model__/meta'
import contactMeta from '@anticrm/contact/src/__model__/meta'

const platform = new Platform()

// const metaModel = require('./model.json') as Doc[]
const strings = require('./strings.json') as Record<string, string>

const loginUrl = process.env.VUE_APP_LOGIN_URL
const account = process.env.VUE_APP_ACCOUNT

if (account) {
  setAccount(platform, JSON.parse(account))
}

// platform.setMetadata(core.metadata.MetaModel, metaModel)
platform.setMetadata(login.metadata.LoginUrl, loginUrl)
platform.setMetadata(i18n.metadata.BootStrings, strings)
platform.setMetadata(ui.metadata.DefaultApplication, mc.component.MissionControl)
platform.setMetadata(mc.metadata.Applications, [
  workbench.component.Workbench,
  demo.component.Periodic,
  storybook.component.Storybook,
  login.component.LoginForm
])

function guard (service: VueService, target: LinkTarget): LinkTarget {
  const account = currentAccount()
  if (account) {
    return target
  }
  const back = service.toUrl(target)
  return { app: login.component.LoginForm, params: { back } }
}

platform.setMetadata(vue.metadata.RouteGuard, guard)

platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin'))
platform.addLocation(rpc, () => import(/* webpackChunkName: "platform-rpc" */ '@anticrm/platform-rpc/src/plugin'))
platform.addLocation(i18n, () => import(/* webpackChunkName: "platform-core-i18n" */ '@anticrm/platform-core-i18n/src/plugin'))
platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin'))
platform.addLocation(presentationUi, () => import(/* webpackChunkName: "presentation-ui" */ '@anticrm/presentation-ui/src/plugin'))
platform.addLocation(business, () => import(/* webpackChunkName: "platform-business" */ '@anticrm/platform-business/src/plugin'))
platform.addLocation(vue, () => import(/* webpackChunkName: "platform-vue" */ '@anticrm/platform-vue/src/plugin'))
platform.addLocation(workbench, () => import(/* webpackChunkName: "platform-workbench" */ '@anticrm/platform-workbench/src/plugin'))
platform.addLocation(contact, () => import(/* webpackChunkName: "contact" */ '@anticrm/contact/src/plugin'))
platform.addLocation(chunter, () => import(/* webpackChunkName: "chunter" */ '@anticrm/chunter/src/plugin'))
platform.addLocation(demo, () => import(/* webpackChunkName: "demo-3d" */ '@anticrm/demo-3d/src/plugin'))
platform.addLocation(mc, () => import(/* webpackChunkName: "mission-control" */ '@anticrm/app-mission-control/src/plugin'))
platform.addLocation(storybook, () => import(/* webpackChunkName: "storybook" */ '@anticrm/app-storybook/src/plugin'))
platform.addLocation(login, () => import(/* webpackChunkName: "login" */ '@anticrm/platform-login/src/plugin'))

uiMeta(platform)
workbenchMeta(platform)
contactMeta(platform)

async function boot (): Promise<void> {
  const uiComponentsService = await platform.getPlugin(vue.id)
  uiComponentsService.getApp().mount('#app')
}

boot().catch(err => {
  console.log(err)
  createApp(ErrorPage).mount('#app')
})
