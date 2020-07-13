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
import login from '@anticrm/login'
import workbench from '@anticrm/workbench'

import uiMeta from '@anticrm/platform-ui/src/__meta__/meta'
import recruitmentMeta from '@anticrm/recruitment/src/__meta__/meta'
import taskMeta from '@anticrm/task/src/__meta__/meta'

const platform = createPlatform()

platform.setMetadata(ui.metadata.DefaultApplication, login.component.LoginForm)

platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin'))
platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin'))
platform.addLocation(login, () => import(/* webpackChunkName: "login" */ '@anticrm/login/src/plugin'))
platform.addLocation(workbench, () => import(/* webpackChunkName: "workbench" */ '@anticrm/workbench/src/plugin'))

uiMeta(platform)
recruitmentMeta(platform)
taskMeta(platform)

export default platform
