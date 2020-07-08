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
import { defineComponent, ref, computed } from 'vue'
import { getSession } from '@anticrm/platform-vue'
import { LoginInfo } from '@anticrm/platform-login'
import contact from '@anticrm/contact'

import NewItemMenu from './NewItemMenu.vue'
import Action from '@anticrm/platform-vue/src/components/Action.vue'

import workbench, { AccountLocalStorage } from '../..'

export default defineComponent({
  components: { NewItemMenu, Action },
  props: {
    path: String,
    params: Object
  },
  setup () {
    const accountJson = localStorage.getItem(AccountLocalStorage)
    const account = JSON.parse(accountJson) as LoginInfo

    const session = getSession()
    const cursor = session.find(contact.class.Person, {
      email: account.email as any // TODO: fix `find`
    })
    cursor.all().then(persons => {
      console.log('PERSONS')
      console.log(persons)
    })

    return { workbench }
  }
})
</script>

<template>
  <div class="workbench-header">
    <div class="container">
      <NewItemMenu />
      <div class="left">Left</div>
      <div class="right">
        <Action :action="workbench.method.Logout">Logout</Action>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";
.workbench-header {
  line-height: $pictogram-size;

  .container {
    display: flex;

    .left {
      flex-grow: 1;
    }

    .rigth {
      flex-grow: 4;
      display: flex;
      flex-direction: row-reverse;
    }
  }
}
</style>