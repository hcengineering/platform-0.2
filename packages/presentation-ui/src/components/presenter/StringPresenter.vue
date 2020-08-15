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
import { defineComponent, PropType, ref, watch } from 'vue'
import { AttrModel } from '@anticrm/presentation-core'

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'

export default defineComponent({
  components: { InlineEdit },
  props: {
    attribute: {
      type: Object as PropType<AttrModel>,
      required: true
    },
    modelValue: String,
    maxWidth: {
      type: Number,
      default: 300
    }
  },
  setup (props, context) {
    const value = ref('')
    watch(() => props.modelValue, v => value.value = v)

    return {
      value,
      onChange (event) {
        context.emit('update:modelValue', value.value)
      }
    }
  },
})

</script>

<template>
  <InlineEdit :placeholder="attribute.placeholder" v-model="value" @change="onChange" />
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";
</style>
