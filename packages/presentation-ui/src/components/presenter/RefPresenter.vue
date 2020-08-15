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
import { defineComponent, PropType, ref } from 'vue'
import { Doc, PropertyType } from '@anticrm/platform'
import { RefTo } from '@anticrm/platform-core'
import { getCoreService, getPresentationCore } from '../../utils'
import presentationCore, { AttrModel } from '@anticrm/presentation-core'

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
    const coreService = getCoreService()
    const presentationCoreService = getPresentationCore()

    const lookupComponent = ref('')
    const type = props.attribute.type as RefTo<Doc>
    lookupComponent.value = presentationCoreService.getComponentExtension(type.to, presentationCore.class.LookupForm)

    const prefix = ref('')
    const value = ref(props.modelValue)
    const visible = ref(false)

    return {
      lookupComponent,
      prefix,
      value,
      visible,
      // onUpdateValue (value: string) {
      //   console.log('value: ', value)
      //   context.emit('update:modelValue', value)
      // },
      onFocus (e) {
        visible.value = true
      },
      onBlur (e) {
        visible.value = false
        if (value.value) {
          if (value.value !== props.modelValue) {
            context.emit('update:modelValue', value)
          }
        } else {
          if (prefix.value.length === 0) {
            context.emit('update:modelValue', null)
          } else {
            value.value = props.modelValue
          }
        }
      }
    }
  },
})

</script>

<template>
  <div class="presentation-ui-ref-presenter">
    <div class="lookup">
      <widget
        :component="lookupComponent"
        :visible="visible"
        v-model="value"
        v-model:lookup="prefix"
      />
    </div>
    <InlineEdit
      :placeholder="attribute.placeholder"
      v-model="prefix"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.presentation-ui-ref-presenter {
  .lookup {
    position: relative;
    display: inline-block;
  }
}
</style>
