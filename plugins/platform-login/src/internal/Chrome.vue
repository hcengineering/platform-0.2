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

import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {},
  props: {
    caption: String,
  },
})
</script>

<template>
  <div class="login-chrome">
    <form @status="onStatus" @error="console.log('$event')">
      <div class="caption-2">{{ caption }}</div>
      <slot />
    </form>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.login-chrome {
  form {
    margin: auto;
    margin-top: 20vh;
    width: 30em;
    padding: 2em;
    border: 1px solid $workspace-separator-color;
    border-radius: 1em;

    .status {
      margin-top: 0.5em;
    }

    .field {
      .sparkling-editbox {
        width: 100%;
      }
      margin: 1em 0;
    }

    .actions {
      display: flex;
      margin-top: 1.5em;

      .separator {
        width: 1em;
      }

      .crm-button {
        flex: 1;
      }
    }
  }
}
</style>
