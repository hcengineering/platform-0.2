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
import { defineComponent, ref } from 'vue'

import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

import login from '..'

import { encode } from 'jwt-simple'

type LoginInfo = { token?: string, wsUrl?: string, errorCode?: number }

export default defineComponent({
  components: {
    EditBox,
    Button,
  },
  setup () {
    const username = ref()
    const password = ref()

    const working = ref(false)

    function doLogin () {
      working.value = true
      console.log('login ', username.value, " ", password.value)
      const request = {
        username: username.value,
        password: password.value,
      }

      const url = login.metadata.LoginUrl
      const token = ''

      // fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json;charset=utf-8'
      //   },
      //   body: JSON.stringify(request)
      // }).then(async (response) => {
      //   const json = await response.json() as LoginInfo
      //   if (json.errorCode) {
      //     console.log(json.errorCode)
      //   } else {
      //     this.$platform.setMetadata()
      //   }
      // })


    }

    return { doLogin, username, password, working }
  }
})
</script>

<template>
  <div id="login-form">
    <form>
      <div class="caption-2">Вход в систему</div>

      <slot name="working" v-if="working">Соединяюсь с сервером...</slot>
      <slot name="success" v-else-if="result">{{result}}</slot>
      <slot name="failure" v-else-if="error">{{error}}</slot>

      <div class="field">
        <EditBox placeholder="Электропочта" v-model="username" />
      </div>
      <div class="field">
        <EditBox type="password" placeholder="Пароль" v-model="password" />
      </div>

      <div class="actions">
        <Button>Зарегистрироваться</Button>
        <div class="separator" />
        <Button @click="doLogin">Войти в систему</Button>
      </div>
    </form>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

#login-form {
  form {
    margin: auto;
    margin-top: 100px;
    width: 30em;
    padding: 2em;
    border: 1px solid $workspace-separator-color;
    border-radius: 1em;

    .field {
      .crm-editbox {
        width: 100%;
      }
      margin: 1em 0;
    }

    .actions {
      display: flex;
      margin-top: 1.5em;

      .separator {
        width: 1em;
      }

      .crm-button {
        flex: 1;
      }
    }
  }
}
</style>