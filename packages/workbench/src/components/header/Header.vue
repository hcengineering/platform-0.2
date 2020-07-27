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
  import { getSession } from '@anticrm/platform-vue'
  import { LoginInfo } from '@anticrm/platform-login'
  import contact from '@anticrm/contact'

  import NewItemMenu from './NewItemMenu.vue'
  import Action from '@anticrm/platform-vue/src/components/Action.vue'

  import workbench, { AccountLocalStorage } from '../..'

  export default defineComponent({
    components: {NewItemMenu, Action},
    props: {
      path: String,
      params: Object
    },
    setup() {

      const name = ref('')

      const accountJson = localStorage.getItem(AccountLocalStorage)
      const account = JSON.parse(accountJson) as LoginInfo

      const session = getSession()
      const cursor = session.find(contact.class.Person, {
        email: account.email as any // TODO: fix `find`
      })
      cursor.all().then(persons => {
        console.log('PERSONS', persons)
        if (persons.length === 1) {
          name.value = persons[0].firstName + ' ' + persons[0].lastName
        } else {
          name.value = 'No account'
        }
      })

      return {workbench, name}
    }
  })
</script>

<template>
  <div class="workbench-header">
    <div class="container">
      <div class="valign">
        <NewItemMenu/>
      </div>
      <div class="right">
        <div>
          <div>{{ name }}</div>
          <div>
            <Action :action="workbench.method.Logout">Logout</Action>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/css/_variables.scss";

  .workbench-header {
    height: 100%;
    width: 100%;

    .container {
      display: flex;

      .valign {
        line-height: $pictogram-size;
      }

      .right {
        flex-grow: 1;
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }
</style>