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

import { Metadata, Plugin, plugin, Service } from '@anticrm/platform'
import { AnyComponent } from '@anticrm/platform-ui'

export interface LoginInfo {
  email: string
  workspace: string
  server: string
  port: string
  token: string
}

export interface Account {
  account: string
  server: string
  port: string
  token: string
}

// export function currentAccount (): Account | null {
//   const account = localStorage.getItem('account')
//   return account ? JSON.parse(account) : null
// }
//
// export function setAccount (platform: Platform, account: Account) {
//   localStorage.setItem('account', JSON.stringify(account))
//
//   platform.setMetadata(rpc.metadata.WSHost, account.server)
//   platform.setMetadata(rpc.metadata.WSPort, account.port)
// }
//
// export function logout (vueService: VueService) {
//   localStorage.removeItem('account')
//   vueService.navigate(login.component.LoginForm)
// }

const login = plugin('login' as Plugin<Service>, {}, {
  component: {
    LoginForm: '' as AnyComponent,
    SignupForm: '' as AnyComponent
  },
  metadata: {
    LoginUrl: '' as Metadata<string>
  }
})

export default login
