<!--
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
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { OK, Status, Severity } from '@anticrm/status'

  import Form from './Form.svelte'
  import { Code, doLogin } from '../utils'

  const dispatch = createEventDispatcher()

  const fields = [
    { name: 'username', i18n: Code.Email },
    {
      name: 'password',
      i18n: Code.Password,
      password: true
    },
    { name: 'workspace', i18n: Code.Workspace }
  ]

  const object = {
    workspace: '',
    username: '',
    password: '',
  }

  let status = OK

  const action = { 
    i18n: Code.LogIn,
    func: async () => { 
      status = new Status(Severity.INFO, Code.ConnectingToServer, {})

      const [loginStatus, result] = await doLogin(object.username, object.password, object.workspace)

      return new Promise<void>((resolve, reject) => {
        setTimeout(() => { 
          status = loginStatus
          resolve() 
        }, 1000)
      })
    }
  }


</script>

<Form caption={Code.LogIn} {status} {fields} {object} {action}
  bottomCaption={Code.DoNotHaveAnAccount}
  bottomActionLabel={Code.SignUp}
  bottomActionFunc={() => { dispatch('switch', 'signup') }}
/>
