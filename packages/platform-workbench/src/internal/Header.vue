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
import core, { Ref, Class, Obj, Doc, CoreService, Instance } from '@anticrm/platform-core'
import { UIDecorator } from '@anticrm/platform-ui'
import workbench, { DocCreateAction, getCoreService, getUIService } from '..'

import LinkTo from '@anticrm/platform-vue/src/components/LinkTo.vue'

export default defineComponent({
  components: { LinkTo },
  setup () {
    const actions = ref([] as Instance<DocCreateAction>[])

    getCoreService().find(workbench.class.DocCreateAction, {})
      .then(acts => { actions.value = acts })

    function uiDecorator (_class: Ref<Class<Obj>>) {
      return getUIService().getClassModel(_class)
    }

    return { actions }
  }
})
</script>

<template>
  <div>
    <div v-for="action in actions" :key="action._id">
      <LinkTo :path="action.id">{{action.clazz}}</LinkTo>
    </div>
  </div>
</template>
