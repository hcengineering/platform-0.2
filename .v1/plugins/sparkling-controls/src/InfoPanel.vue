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
    caption: String
  },
})
</script>

<template>
  <div class="mc-info-panel">
    <div class="caption-4 caption">{{caption}}</div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.mc-info-panel {
  display: flex;

  margin: 2em;

  .caption {
    border-right: $content-color solid 1px;
    padding-right: 1em;
    text-align: right;
    width: 150px;
  }

  .content {
    padding-left: 1em;
  }
}
</style>