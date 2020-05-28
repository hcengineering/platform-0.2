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
    disabled: Boolean
  }
})
</script>

<template>
  <button type="button" class="erp-button" :disabled="disabled">
    <slot />
  </button>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.erp-button {
  display: inline-block;
  border: 1px solid currentColor;
  border-radius: 2em;
  padding: 0.5em 1.33em 0.5em;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  text-align: center;

  font: inherit;
  font-weight: 400;

  color: inherit;
  background-color: inherit;

  &.large {
    padding: 0.75em 1.5em 0.75em;
  }

  &:hover {
    // border-color: $highlight-color;
    // box-shadow:inset 0px 0px 2px 0px $highlight-color;
    // color: $highlight-color;
    // background-color: $highlight-color;
    background-color: darken($highlight-color, 5%);
  }

  &.primary {
    // border-color: $highlight-color;
    background-color: $highlight-color;
    // color: $nav-bg-color;
    font-weight: bold;
  }

  &:hover.primary {
    background-color: darken($highlight-color, 5%);
    // border-color: $highlight-color;
    // box-shadow:inset 0px 0px 3px 0px currentColor;
    // color: $highlight-color;
  }
}
</style>
