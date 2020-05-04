<!--
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import Vue from 'vue'

export default Vue.extend({
  props: {
    value: String,
    placeholder: {
      type: String,
      required: true
    }
  },
  methods: {
    computeSize(value: string) {
      const input = this.$refs['input'] as HTMLElement
      const div = this.$refs['compute'] as HTMLElement
      if (!value || value.length == 0)
        value = this.placeholder
      div.innerHTML = value.replace(/ /g, '&nbsp;')
      input.style.width = div.clientWidth + 'px'
    },
    onInput(value: string) {
      this.computeSize(value)
      this.$emit('input', value)
    }
  },
  mounted() {
    this.computeSize(this.value)
  }
})

</script>

<template>
  <div class="erp-inline-editbox">
    <div ref="compute" class="compute-width"></div>
    <input
      ref="input"
      type="text"
      :value="value"
      :placeholder="placeholder"
      @input="onInput($event.target.value)"
    />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/platform-ui-theme/css/_variables.scss";
@import "~@anticrm/platform-ui-theme/css/_components.scss";

.erp-inline-editbox {
  display: inline-flex;
  box-sizing: border-box;

  border: 1px solid transparent;
  border-radius: 2px;

  // padding: 0px 0px;

  &:focus-within {
    border-color: $highlight-color;
  }

  .compute-width {
    position: absolute;
    white-space: nowrap;
    visibility: hidden;
  }

  input {
    // padding: 0; // Chrome
    // margin: 0; // Safari :)
    border: none;
    color: inherit;
    background-color: inherit;
    font: inherit;
    // font-family: $font-input;
    // font-weight: 300;
    // font-size: 14px;

    &:focus {
      outline: none;
    }
  }
}
</style>
