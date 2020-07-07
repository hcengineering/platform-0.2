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

import { Request, Response } from '@anticrm/rpc'

import { defineComponent, ref } from 'vue'
import { getVueService } from '@anticrm/platform-vue'

import Chrome from './Chrome.vue'
import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

import login from '..'

import { encode } from 'jwt-simple'

export default defineComponent({
  components: {
    Chrome,
  },
  setup () {
    const vueService = getVueService()

    const object = { username: '', password: '', workspace: '' }
    const info = ref('')
    const error = ref('')

    function doSignup () {
      vueService.navigate('/' + login.component.SignupForm)
    }

    async function doLogin () {
      info.value = "Соединяюсь с сервером..."

      const url = this.$platform.getMetadata(login.metadata.LoginUrl)

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
        if (result.error) {
          error.value = result.error.message
        }
      } catch (err) {
        error.value = 'Не могу соедениться с сервером.'
      }
    }

    return { doLogin, doSignup, object, info, error }
  }
})
</script>

<template>
  <Chrome
    caption="Вход в систему"
    description="Нажмите 'Войти в систему' для продолжения."
    :info="info"
    :error="error"
    :object="object"
    :fields="{  
      username: { i18n: 'Электропочта' }, 
      password: { i18n: 'Пароль', type: 'password'},
      workspace: { i18n: 'Рабочее пространство'}
    }"
    :actions="[
      { i18n: 'Создать пространство', func: doSignup },
      { i18n: 'Войти в систему', func: doLogin },
    ]"
  />
</template>
