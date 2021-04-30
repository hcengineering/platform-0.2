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
  import Form from './Form.svelte'

  const fields = [
    { name: 'username', i18n: 'Email' },
    {
      name: 'password',
      i18n: 'Password',
      password: true
    },
    { name: 'workspace', i18n: 'Workspace' }
  ]

  const action = { 
    i18n: 'Login',
    func: async () => { 
      console.log('loging in...') 
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => { resolve() }, 1000)
      })
    }
  }

  let object = {
    workspace: '',
    username: '',
    password: '',
  }
</script>

<Form caption="Log In" {fields} {object} {action}/>
