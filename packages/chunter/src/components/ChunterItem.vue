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

import { defineComponent, ref, PropType } from 'vue'
import { CreateTx } from '@anticrm/platform'

import { getCoreService, getContactService } from '../utils'
import { User } from '@anticrm/contact'

export default defineComponent({
  components: {
  },
  props: {
    tx: Object as PropType<CreateTx>
  },
  setup (props, context) {
    const contactService = getContactService()

    const user = ref<User | undefined>(undefined)

    contactService.getUser(props.tx._user).then(u => user.value = u)

    return { user }
  }
})
</script>

<template>
  <div class="chunter-chunter-item">
    <img class="avatar" src="../../assets/ava2x48.jpg" />
    <div class="details">
      <b>{{user?.firstName}} {{user?.lastName}} {{ user._id }}</b> 15:23
      <div>{{tx}}</div>
    </div>
  </div>
</template>

<style lang="scss">
.chunter-chunter-item {
  display: flex;
  margin: 1em;

  .avatar {
    object-fit: cover;
    border-radius: 4px;
    width: 3em;
    height: 3em;
  }

  .details {
    padding-left: 1em;
  }
}
</style>