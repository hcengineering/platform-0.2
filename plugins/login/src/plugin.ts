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

import { Platform, Status, Severity } from '@anticrm/platform'
import { Request, Response, serialize, toStatus } from '@anticrm/core'

import { UIService } from '@anticrm/platform-ui'

import login, { LoginService, LoginInfo, ACCOUNT_KEY } from '.'

import LoginForm from './components/LoginForm.svelte'

/*!
 * Anticrm Platform™ Login Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { ui: UIService }): Promise<LoginService> => {

  const uiService = deps.ui

  platform.setResource(login.component.LoginForm, LoginForm)
  // platform.setResource(login.component.SignupForm, SignupForm)

  function setLoginInfo (loginInfo: LoginInfo) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginInfo))

    platform.setMetadata(login.metadata.WhoAmI, loginInfo.email)
    platform.setMetadata(login.metadata.Token, loginInfo.token)
  }

  async function doLogin (username: string, password: string, workspace: string): Promise<Status> {
    const url = platform.getMetadata(login.metadata.LoginUrl);
    if (!url) {
      return new Status(Severity.ERROR, 0, "no login server metadata provided.");
    }

    const request: Request<[string, string, string]> = {
      method: "login",
      params: [username, password, workspace],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: serialize(request),
      });
      const result = (await response.json()) as Response<any>;
      if (result.error?.message) {
        return toStatus(result)
      }
      if (result.result) {
        console.log("result", result.result);
        setLoginInfo(result.result);
        uiService.navigate(
          "/component:workbench.Workbench/application:workbench.Default"
        );
      }
      return new Status(Severity.OK, 0, '')
    } catch (err) {
      return new Status(Severity.ERROR, 0, "Не могу соедениться с сервером.");
    }
  }

  return {
    doLogin,
  }
}