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

  import { Request, Response } from '@anticrm/platform'

  import { defineComponent, ref } from 'vue'
  import { getUIService } from '@anticrm/platform-ui'

  import Form from './Form.vue'

  import login from '..'
  import { getPlatform } from '@anticrm/platform-ui/src'

  export default defineComponent({
    components: {
      Form
    },
    setup() {
      const platform = getPlatform()
      const uiService = getUIService()

      const object = {username: '', password: '', workspace: ''}
      const info = ref('')
      const error = ref('')

      function doSignup() {
        uiService.navigate('/' + login.component.SignupForm)
      }

      async function doLogin() {
        info.value = "Соединяюсь с сервером..."

        const url = platform.getMetadata(login.metadata.LoginUrl)
        if (!url) {
          info.value = "no login server metadata provided."
          return
        }

        const request: Request<[string, string, string]> = {
          method: 'login',
          params: [object.username, object.password, object.workspace]
        }

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(request)
          })
          const result = await response.json() as Response<void>
          if (result.error?.message) {
            error.value = result.error.message
          }
        } catch (err) {
          error.value = 'Не могу соедениться с сервером.'
        }
      }

      return {doLogin, doSignup, object, info, error}
    }
  })
</script>

<template>
  <Form
      :actions="[
      { i18n: 'Создать пространство', func: doSignup },
      { i18n: 'Войти в систему', func: doLogin },
    ]"
      :error="error"
      :fields="{
      username: { i18n: 'Электропочта' },
      password: { i18n: 'Пароль', type: 'password'},
      workspace: { i18n: 'Рабочее пространство'}
    }"
      :info="info"
      :object="object"
      caption="Вход в систему"
      description="Нажмите 'Войти в систему' для продолжения."
  />
</template>
