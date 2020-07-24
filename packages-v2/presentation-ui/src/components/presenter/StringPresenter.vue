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

import { defineComponent, PropType } from 'vue'
import { Class, Obj, Ref } from '@anticrm/platform'

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'

import { ClassModel } from '@anticrm/presentation-core'

export default defineComponent({
  components: { InlineEdit },
  props: {
    _class: {
      type: String as unknown as PropType<Ref<Class<Obj>>>,
    },
    model: {
      type: Object as PropType<ClassModel>
    }
  },
  setup(props) {
  }
})
</script>

<template>
  <InlineEdit />
</template>