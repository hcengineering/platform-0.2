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
import { defineComponent, watch, ref } from 'vue'

export default defineComponent({
  props: {
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

    const input = ref<HTMLElement>(null)
    const compute = ref<HTMLElement>(null)

    function computeSize (value: string) {
      if (!value || value.length == 0)
        value = props.placeholder
      if (typeof value === 'string')
        compute.value.innerHTML = value.replace(/ /g, '&nbsp;')
      const width = compute.value.clientWidth > props.maxWidth ? props.maxWidth : compute.value.clientWidth
      input.value.style.width = width + 'px'
    }

    watch(() => props.modelValue, value => computeSize(value))

    return {
      input,
      compute,
      computeSize,
      onInput (value: string) {
        computeSize(value)
        this.$emit('update:modelValue', value)
      }
    }
  },
})

</script>

<template>
  <div class="sparkling-inline-edit">
    <div class="control">
      <div ref="compute" class="compute-width"></div>
      <input
        v-bind="$attrs"
        ref="input"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="onInput($event.target.value)"
        @focus="computeSize($event.target.value)"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.sparkling-inline-edit {
  min-width: 12em;
  display: inline-block;

  .control {
    display: inline-flex;
    box-sizing: border-box;

    border: 1px solid transparent;
    border-radius: 2px;

    &:focus-within {
      border-color: $highlight-color;
    }

    .compute-width {
      position: absolute;
      white-space: nowrap;
      visibility: hidden;
    }

    input {
      border: none;
      color: inherit;
      background-color: inherit;
      font: inherit;

      &:focus {
        outline: none;
      }
    }
  }
}
</style>
