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
  <div class="crm-toolbar-toolbar">
    <div class="left-panel">
      <slot></slot>
    </div>
    <div class="right-panel">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.crm-toolbar-toolbar {
  flex-direction: row;
  display: flex;
  min-height: 2em;
  padding: 2px;
  // background-color: #111111;

  .left-panel {
    display: flex;
    align-items: stretch;
  }
  .right-panel {
    flex-grow: 1;
    display: flex;
    align-items: stretch;
    flex-direction: row-reverse;
  }
}
</style>
