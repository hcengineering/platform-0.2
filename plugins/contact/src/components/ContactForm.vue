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
import { Person } from '..'

import NewContactForm from './NewContactForm.vue'
import ViewContactForm from './ViewContactForm.vue'
import BrowseContactForm from './BrowseContactForm.vue'

export default defineComponent({
  components: { NewContactForm, BrowseContactForm, ViewContactForm },
  props: {
    resource: String as unknown as PropType<Ref<Class<Person>>>,
    operation: String,
    params: Object
  }
})
</script>

<template>
  <div class="contact-contact-form">
    <NewContactForm v-if="operation === 'new'" :resource="resource" :params="params" />
    <ViewContactForm v-if="operation === 'view'" :resource="resource" :params="params" />
    <BrowseContactForm v-else :resource="resource" :params="params" />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.contact-contact-form {
  height: 100%;
}
</style>
