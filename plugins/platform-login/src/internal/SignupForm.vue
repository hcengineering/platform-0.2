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

type LoginInfo = { token?: string, wsUrl?: string, errorCode?: number }

export default defineComponent({
  components: {
    Chrome,
    EditBox,
    Button,
  },
  setup () {

    const vueService = getVueService()
    const status = ref('Введите ваши данные.')

    const username = ref('')
    const password = ref('')
    const first = ref('')
    const last = ref('')

    function doLogin () {
      vueService.navigate('/' + login.component.LoginForm)
    }

    function doSignup () {
      status.value = 'Соединяюсь с сервером'

      console.log('login ', username.value, " ", password.value)
      const request: Request<[string, string]> = {
        method: 'login',
        params: [username.value, password.value]
      }

      const url = this.$platform.getMetadata(login.metadata.LoginUrl)
      const token = ''

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(request)
      }).then(async (response) => {
        console.log(response)
        return response.json()
      }).then(json => {
        const result = json as Response<void>
        console.log(result)
        if (result.error) {
          status.value = result.error.message
        }
      }).catch(err => {
        status.value = 'Не могу соедениться с сервером.'
      })
    }

    return { status, doLogin, username, password, first, last }
  }
})
</script>

<template>
  <Chrome caption="Регистрация в системе">
    <div class="status">{{ status }}</div>

    <div class="field">
      <EditBox name="first" type="text" placeholder="Имя" v-model="first" autocomplete="first" />
    </div>

    <div class="field">
      <EditBox name="last" type="text" placeholder="Фамилия" v-model="last" autocomplete="last" />
    </div>

    <div class="field">
      <EditBox
        name="username"
        type="text"
        placeholder="Электропочта"
        v-model="username"
        autocomplete="username"
      />
    </div>

    <div class="field">
      <EditBox
        name="password"
        type="password"
        placeholder="Пароль"
        v-model="password"
        autocomplete="new-password"
      />
    </div>

    <div class="actions">
      <Button @click="doLogin">Войти в систему</Button>
      <div class="separator" />
      <Button>Зарегистрироваться</Button>
    </div>
  </Chrome>
</template>
