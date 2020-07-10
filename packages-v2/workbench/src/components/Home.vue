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
import { defineComponent } from 'vue'
import contact from '@anticrm/contact'
import chunter from '@anticrm/chunter'
import vue from '@anticrm/platform-vue'

import LinkTo from '@anticrm/platform-vue/src/components/LinkTo.vue'
import Action from '@anticrm/platform-vue/src/components/Action.vue'

export default defineComponent({
  components: { LinkTo, Action },
  setup () {
    return { contact, vue, chunter }
  }
})
</script>

<template>
  <div>
    <LinkTo :path="`${contact.class.Person}/new`">Новая Персона</LinkTo>
    <br />
    <LinkTo :path="`${contact.class.Person}`">Список Персон</LinkTo>
    <br />
    <LinkTo :path="`${chunter.component.Chunter}`">Chunter!</LinkTo>
    <Suspense>
      <Action :action="vue.method.AnAction" hi="there">Hello</Action>
    </Suspense>
  </div>
</template>
