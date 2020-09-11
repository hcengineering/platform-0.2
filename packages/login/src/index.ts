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

import { inject } from 'vue'
import { Metadata, Plugin, plugin, Service } from '@anticrm/platform'
import ui, { AnyComponent } from '@anticrm/platform-ui'

export interface LoginInfo {
  email: string
  workspace: string
  server: string
  port: string
  token: string
}

// export interface Account {
//   account: string
//   server: string
//   port: string
//   token: string
// }

export const ACCOUNT_KEY = 'anticrm-account'

export function currentAccount (): LoginInfo | null {
  const account = localStorage.getItem(ACCOUNT_KEY)
  return account ? JSON.parse(account) : null
}

// export function setAccount (account: LoginInfo) {
//   localStorage.setItem('account', JSON.stringify(account))

//   // platform.setMetadata(rpc.metadata.WSHost, account.server)
//   // platform.setMetadata(rpc.metadata.WSPort, account.port)
// }

// export function logout (vueService: VueService) {
//   localStorage.removeItem('account')
//   vueService.navigate(login.component.LoginForm)
// }

// P L U G I N

export interface LoginService extends Service {
  setLoginInfo (loginInfo: LoginInfo): void
}

export const LoginServiceInjectionKey = 'login-injection-key'

export function getLoginService (): LoginService {
  return inject(LoginServiceInjectionKey) as LoginService
}

const login = plugin('login' as Plugin<LoginService>, { ui: ui.id }, {
  component: {
    LoginForm: '' as AnyComponent,
    SignupForm: '' as AnyComponent
  },
  metadata: {
    LoginUrl: '' as Metadata<string>,
    Token: '' as Metadata<string>,
    WhoAmI: '' as Metadata<string>
  }
})

export default login
