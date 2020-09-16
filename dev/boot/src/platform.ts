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

import { createPlatform } from '@anticrm/platform'

import ui from '@anticrm/platform-ui'
import core from '@anticrm/platform-core'
import i18n from '@anticrm/platform-i18n'
import login from '@anticrm/login'
import workbench from '@anticrm/workbench'
import presentation from '@anticrm/presentation'
import task from '@anticrm/task'
// import presentationUI from '@anticrm/presentation-ui'
// import contact from '@anticrm/contact'
// import chunter from '@anticrm/chunter'
// import recruitment from '@anticrm/recruitment'

import uiMeta from '@anticrm/platform-ui/src/__meta__/meta'
import workbenchMeta from '@anticrm/workbench/src/__meta__'
// import chunterMeta from '@anticrm/chunter/src/__meta__/meta'
// import contactMeta from '@anticrm/contact/src/__meta__/meta'
// import recruitmentMeta from '@anticrm/recruitment/src/__meta__/meta'
// import taskMeta from '@anticrm/task/src/__meta__/meta'

const platform = createPlatform()

platform.setMetadata(ui.metadata.DefaultApplication, login.component.LoginForm)

platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin'))
platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin'))
platform.addLocation(i18n, () => import(/* webpackChunkName: "platform-i18n" */ '@anticrm/platform-i18n/src/plugin'))
platform.addLocation(login, () => import(/* webpackChunkName: "login" */ '@anticrm/login/src/plugin'))
platform.addLocation(presentation, () => import(/* webpackChunkName: "presentation-core" */ '@anticrm/presentation/src/plugin'))
platform.addLocation(workbench, () => import(/* webpackChunkName: "workbench" */ '@anticrm/workbench/src/plugin'))
platform.addLocation(task, () => import(/* webpackChunkName: "task" */ '@anticrm/task/src/plugin'))
// platform.addLocation(presentationUI, () => import(/* webpackChunkName: "presentation-ui" */ '@anticrm/presentation-ui/src/plugin'))
// platform.addLocation(contact, () => import(/* webpackChunkName: "contact" */ '@anticrm/contact/src/plugin'))
// platform.addLocation(chunter, () => import(/* webpackChunkName: "chunter" */ '@anticrm/chunter/src/plugin'))
// platform.addLocation(recruitment, () => import(/* webpackChunkName: "recruitment" */ '@anticrm/recruitment/src/plugin'))

uiMeta(platform)
workbenchMeta(platform)
// chunterMeta(platform)
// recruitmentMeta(platform)
// taskMeta(platform)
// contactMeta(platform)

export default platform
