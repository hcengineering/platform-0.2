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
import { defineComponent, PropType } from 'vue'

import { Instance } from '@anticrm/platform-core'
import { DocMessage } from '..'

export default defineComponent({
  components: {},
  props: {
    message: Object as PropType<Instance<DocMessage>>
  },
  setup(props) {
    // do some processing on message text if required.
    return {outerHtml: props.message.text}
  }
})
</script>

<template>
  <div class="chunter-message">
    <div>img</div>
    <div class="content">
      <div class="caption-4">Andrey Platov</div>
       <div v-html="outerHtml"></div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.chunter-message {
  display: flex;
  margin-top: 1em;

  .content {
    display: flex;
    flex-direction: column;
  }
}
</style>
