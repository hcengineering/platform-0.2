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
    disabled: Boolean,
    selected: Boolean
  }
})
</script>

<template>
  <button
    type="button"
    class="crm-toolbar-button"
    :disabled="disabled"
    :class="{'selected':selected}">
    <slot />
  </button>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.crm-toolbar-button {
  display: inline-block;
  border: 0px solid currentColor;
  border-radius: 2px;
  padding: 0.5em 1em 0.5em;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  text-align: center;

  font: inherit;
  font-weight: 400;

  color: inherit;
  background-color: inherit;

  &:focus {
    outline: none;
    border-color: $highlight-color;
    box-shadow: inset 0px 0px 2px 0px $highlight-color;
  }

  &.large {
    padding: 0.75em 1.5em 0.75em;
  }
  &.small {
    padding: 0 0.6em 0;
  }

  &.selected {
    background-color: $highlight-color;
    font-weight: bold;
    background-color: darken($highlight-color, 10%);
  }

  &:hover {
    border-color: $highlight-color;
    // color: $highlight-color;
    // background-color: $highlight-color;
    background-color: darken($highlight-color, 30%);
  }
}
</style>
