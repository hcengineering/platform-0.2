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
import presentationCore from '@anticrm/presentation-core'

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'

export default defineComponent({
  components: { InlineEdit },
  props: {
    type: {
      type: Object as PropType<RefTo<Doc>>,
      required: true
    },
    attributeKey: {
      type: String,
      required: true
    },
    modelValue: String,
    placeholder: {
      type: String,
      required: true
    },
    maxWidth: {
      type: Number,
      default: 300
    }
  },
  setup (props, context) {
    const coreService = getCoreService()
    const presentationCoreService = getPresentationCore()

    const lookupComponent = ref('')
    lookupComponent.value = presentationCoreService.getComponentExtension(props.type.to, presentationCore.class.LookupForm)

    const prefix = ref('')

    return {
      lookupComponent,
      prefix,
      onUpdateValue (value: string) {
        console.log('value: ', value)
        context.emit('update:modelValue', value)
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
        v-model:lookup="prefix"
        :modelValue="modelValue"
        @update:modelValue="onUpdateValue"
      />
    </div>
    <InlineEdit :placeholder="placeholder" v-model="prefix" />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.presentation-ui-ref-presenter {
  .lookup {
    position: relative;
    display: inline-block;

    // .content {
    //   position: absolute;
    //   bottom: 100%;
    //   left: 100%;

    //   background-color: $input-color;
    //   border: 1px solid $content-color-dark;
    //   border-radius: 4px;

    //   padding: 0.5em;
    //   margin: 0;
    //   margin-bottom: 1.5em;
    // }
  }
}
</style>
