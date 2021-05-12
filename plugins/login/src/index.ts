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

// P L U G I N

import { Metadata, plugin, Plugin, Service, Status } from '@anticrm/platform'
import ui, { AnyComponent } from '@anticrm/platform-ui'

export interface LoginInfo {
  email: string
  workspace: string
  server: string
  port: string
  token: string
  secondFactorEnabled: boolean
  telegramToken: string
}

export const ACCOUNT_KEY = 'anticrm-account'

export function currentAccount (): LoginInfo | null {
  const account = localStorage.getItem(ACCOUNT_KEY)
  return (account !== null) ? JSON.parse(account) as LoginInfo : null
}

export interface LoginService extends Service {
  /**
   * Perform a login operation to required workspace with user credentials.
   */
  doLogin: (username: string, password: string, workspace: string, secondFactorCode: string) => Promise<Status>

  /**
   * Check and auto return login information if available.
   */
  getLoginInfo: () => Promise<LoginInfo | undefined>

  /**
   * Do navigate to default application if defined.
   */
  navigateApp: () => void

  /**
  * Do navigate to login form
  */
  navigateLoginForm: () => void

  /**
  * Save profile settings
  */
  saveSetting: (password: string, newPassword: string, secondFactorEnabled: boolean, clientSecret: string, secondFactorCode: string) => Promise<Status>

  /**
   * Do logout from current logged in account
   */
  doLogout: () => Promise<void>
}

const login = plugin('login' as Plugin<LoginService>, { ui: ui.id }, {
  component: {
    LoginForm: '' as AnyComponent,
    SettingForm: '' as AnyComponent,
    MainLoginForm: '' as AnyComponent,
    SignupForm: '' as AnyComponent
  },
  metadata: {
    AccountsUrl: '' as Metadata<string>
  }
})

export default login
