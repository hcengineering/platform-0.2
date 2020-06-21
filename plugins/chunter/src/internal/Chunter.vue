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

import Chat from './Chat.vue'
import ChatInput from './ChatInput.vue'

export default defineComponent({
  components: { Chat, ChatInput },
})
</script>

<template>
  <div id="chunter">
    <nav># general</nav>
    <main>
      <Chat />
      <ChatInput />
    </main>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

#chunter {
  display: flex;
  align-items: stretch;

  height: 100%;

  font-size: 13px;

  nav {
    width: 250px;

    background-color: $nav-bg-color;
    border-left: 1px solid $workspace-separator-color;
    border-right: 1px solid $workspace-separator-color;

    padding: 1em;
  }

  main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    background-color: $content-bg-color;
    padding: 0em 1em;
  }
}
</style>
