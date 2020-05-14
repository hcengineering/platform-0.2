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

import Vue, { PropType } from 'vue'
import platform from '@anticrm/platform'

import core, { Obj, Ref, Class } from '@anticrm/platform-core'

import { Person } from '..'

import ui, { UIPlugin, AttrModel } from '@anticrm/platform-ui'

import ObjectPanel from '@anticrm/platform-ui/src/components/ObjectPanel.vue'
import InlineEdit from '@anticrm/platform-ui-controls/src/InlineEdit.vue'

export default Vue.extend({
  components: { ObjectPanel, InlineEdit },
  props: {
    object: Object as PropType<Person>,
  },
})
</script>

<template>
  <div>
    <InlineEdit class="caption-1" v-model="object.firstName" placeholder="Фамилия" />
    <br />
    <InlineEdit class="caption-2" v-model="object.lastName" placeholder="Имя Отчество" />
    <ObjectPanel :object="object" style="margin-top: 2em" />
  </div>
</template>


<style scoped lang="scss">
@import "~@anticrm/platform-ui-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
