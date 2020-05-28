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
import Vue from 'vue'

export default Vue.extend({})
</script>

<template>
  <div class="storybook-theme">
    <slot />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_globals.scss";

.storybook-theme {
  padding: 16px;
  background-color: $content-bg-color;

  @include root-style;
}
</style>
