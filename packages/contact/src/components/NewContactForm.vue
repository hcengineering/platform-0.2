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
import { Platform, Resource, getResourceKind } from '@anticrm/platform'
import core, { Ref, Doc, Class, Instance, ClassKind, Property } from '@anticrm/platform-core'
import { AnyComponent } from '@anticrm/platform-ui'
import { injectPlatform } from '@anticrm/platform-vue'
import { Person } from '..'

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'
import ObjectPanel from '@anticrm/platform-vue/src/components/ObjectPanel.vue'
import Table from '@anticrm/platform-vue/src/components/Table.vue'

function str (value: string): Property<string> { return value as unknown as Property<string> }

export default defineComponent({
  components: { InlineEdit, ObjectPanel, Table },
  props: {
    resource: String as unknown as PropType<Ref<Class<Person>>>,
    operation: String,
    params: Object
  },
  async setup (props, context) {
    const _ = await injectPlatform({ core: core.id })
    const coreService = _.deps.core

    let document: Ref<Person>
    if (getResourceKind(props.resource) === ClassKind) {
      const _class = props.resource as Ref<Class<Person>>
      document = coreService.getDb().createDocument(_class, {
        firstName: str('Дмитрий Сергеевич'),
        lastName: str('Либерзон'),
        phone: str('+7 913 333 7777')
      })._id
    }
    const instance = await coreService.getInstance(document)
    return {
      instance
    }
  }
})
</script>

<template>
  <div>
    <div>
      <InlineEdit class="caption-1" v-model="instance.lastName" placeholder="Фамилия" />
    </div>
    <div>
      <InlineEdit class="caption-2" v-model="instance.firstName" placeholder="Имя Отчество" />
    </div>
    <Suspense>
      <ObjectPanel
        :instance="instance"
        top="class:core.Doc"
        exclude="firstName, lastName"
        style="margin-top: 2em"
      />
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
