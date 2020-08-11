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
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    attributeKey: {
      type: String,
      required: true
    },
    value: String,
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
    return {
      computeSize (value: string) {
        const input = this.$refs['input'] as HTMLElement
        const div = this.$refs['compute'] as HTMLElement
        if (!value || value.length == 0)
          value = props.placeholder
        div.innerHTML = value.replace(/ /g, '&nbsp;')
        const width = div.clientWidth > props.maxWidth ? props.maxWidth : div.clientWidth
        input.style.width = width + 'px'
      },
      onInput (value: string) {
        this.computeSize(value)
      },
      onBlur (value: string) {
        if (value !== props.value) {
          context.emit('update', { value, key: props.attributeKey })
        }
      }
    }
  },
  mounted () {
    const input = this.$refs['input'] as HTMLInputElement
    input.addEventListener('focus', () => this.computeSize(input.value))
  },
})

</script>

<template>
  <div class="presentation-ui-ref-presenter">
    <div class="control">
      <div ref="compute" class="compute-width"></div>
      <input
        ref="input"
        type="text"
        :value="value"
        :placeholder="placeholder"
        @input="onInput($event.target.value)"
        @blur="onBlur($event.target.value)"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.presentation-ui-ref-presenter {
  min-width: 12em;

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
