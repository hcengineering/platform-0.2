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
import { defineComponent, ref, reactive, inject, computed, PropType } from 'vue'
import core, { Ref, Doc, Class, Instance, ClassKind } from '@anticrm/platform-core'
import { getSession, getUIService } from '@anticrm/platform-vue'

import { Person } from '..'

import Table from '@anticrm/platform-vue/src/components/Table.vue'
import LinkTo from '@anticrm/platform-vue/src/components/LinkTo.vue'

export default defineComponent({
  components: { Table, LinkTo },
  props: {
    resource: String as unknown as PropType<Ref<Class<Person>>>,
    params: Object
  },
  setup (props) {
    const session = getSession()
    const uiService = getUIService()

    const model = ref([])
    const content = ref([])

    session.getInstance(props.resource)
      .then(clazz => uiService.getAttrModel(clazz))
      .then(attrs => model.value = attrs)

    session.query(props.resource, {}, result => {
      console.log('QUERY return: ')
      console.log(result)
      content.value = result
    })

    return { model, content }
  }
})
</script>

<template>
  <div>
    <div class="caption-1">Персоны</div>
    <LinkTo :path="`${resource}/new`">Новая Персона</LinkTo>
    <Table :model="model" :content="content" />
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";
</style>
