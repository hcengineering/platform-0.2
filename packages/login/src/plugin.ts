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

import { Platform, Service } from '@anticrm/platform'

import login, { LoginInfo, LoginService, ACCOUNT_KEY, LoginServiceInjectionKey } from '.'
import LoginForm from './internal/LoginForm.vue'
import SignupForm from './internal/SignupForm.vue'
import { UIService } from '@anticrm/platform-ui'

/*!
 * Anticrm Platform™ Login Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { ui: UIService }): Promise<LoginService> => {
  platform.setResource(login.component.LoginForm, LoginForm)
  platform.setResource(login.component.SignupForm, SignupForm)

  const service = {
    // whoAmI (): LoginInfo | null {
    //   const info = localStorage.getItem(loginInfoKey)
    //   if (info) {
    //     return JSON.parse(info)
    //   }
    //   return null
    // },
    setLoginInfo (loginInfo: LoginInfo) {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginInfo))

      platform.setMetadata(login.metadata.WhoAmI, loginInfo.email)
      platform.setMetadata(login.metadata.Token, loginInfo.token)
    }
  }

  deps.ui.getApp()
    .provide(LoginServiceInjectionKey, service)

  return service

}
