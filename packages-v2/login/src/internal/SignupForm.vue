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
import { getPlatform, getUIService } from '@anticrm/platform-ui'

import Form from './Form.vue'

import login from '..'

import { encode } from 'jwt-simple'

export default defineComponent({
  components: {
    Form,
  },
  setup () {
    const platform = getPlatform()
    const uiService = getUIService()

    const object = { username: '', password: '', organisation: '' }
    const info = ref('')
    const error = ref('')

    function doLogin () {
      uiService.navigate('/' + login.component.LoginForm)
    }

    async function createWorkspace () {
      info.value = "Соединяюсь с сервером..."

      const url = platform.getMetadata(login.metadata.LoginUrl)
      if (!url) {
        error.value = "no login server metadata provided."
        return
      }

      try {
        // const request: Request<[string, string, string]> = {
        //   method: 'createWorkspace',
        //   params: [object.username, object.password, object.organisation]
        // }
        // const response = await fetch(url, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json;charset=utf-8' },
        //   body: JSON.stringify(request)
        // })
        // const result = await response.json() as Response<string>
        // if (result.error) {
        //   error.value = result.error.message
        // } else {
        //   const workspace = result.result

        const request: Request<[string, string, string]> = {
          method: 'createWorkspace',
          params: [object.username, object.password, object.organisation]
        }
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify(request)
        })
        const account = await response.json() as Response<void>
        if (account.error?.message) {
          error.value = account.error.message
        }
        // }
      } catch (err) {
        error.value = 'Не могу соедениться с сервером.'
      }

    }

    return { createWorkspace, doLogin, object, info, error }

  }
})
</script>

<template>
  <Form
    caption="Создание рабочего пространства"
    description="Нажмите 'Создать пространство' для продолжения."
    :info="info"
    :error="error"
    :object="object"
    :fields="{  
      username: { i18n: 'Электропочта' }, 
      password: { i18n: 'Пароль', type: 'password'},
      organisation: { i18n: 'Организация'}
    }"
    :actions="[
      { i18n: 'Войти в систему', func: doLogin },
      { i18n: 'Создать пространство', func: createWorkspace },
    ]"
  />
</template>
