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
import { Platform } from '@anticrm/platform'
import { defineComponent, reactive, computed, provide, inject, watch, PropType } from 'vue'
import workbench, { WorkbenchStateInjectionKey, WorkbenchState, ViewModelKind } from '..'
import { UIServiceInjectionKey, PlatformInjectionKey } from '@anticrm/platform-ui-components'
import { Ref, Class, Doc } from '@anticrm/platform-core'

import Button from '@anticrm/sparkling-controls/src/Button.vue'
import MainView from './MainView.vue'

export default defineComponent({
  components: { Button, MainView },
  props: {
    path: String
  }
})
</script>

<template>
  <div id="workbench">
    <header>
      <!-- <Header @add="addObject()" /> -->
      <Button
        @click="this.$emit('pushState', '/component:workbench.Workbench/class:contact.Person')"
      >Go!</Button>
    </header>

    <nav>
      <!-- <Sidenav :applications="applications" /> -->
    </nav>

    <main>
      <Suspense v-if="path">
        <MainView :content="path" />
      </Suspense>
      <div v-else>Nothing to show.</div>
    </main>

    <aside>
      <!-- <FormEditor v-if="leftPane" :object="leftPane" @save="onSave()"></FormEditor> -->
    </aside>

    <footer></footer>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

#workbench {
  display: grid;

  grid-template-columns: $pictogram-size 250px 1fr auto;
  grid-template-rows: $pictogram-size 1fr 24px;

  height: 100vh;

  header {
    grid-column-start: 1;
    grid-column-end: 5;

    grid-row-start: 1;
    grid-row-end: 2;

    background-color: $header-bg-color;
    border-bottom: 1px solid $workspace-separator-color;
  }

  nav {
    grid-column-start: 1;
    grid-column-end: 2;

    grid-row-start: 2;
    grid-row-end: 3;

    background-color: $nav-bg-color;
  }

  main {
    grid-column-start: 2;
    grid-column-end: 4;

    grid-row-start: 2;
    grid-row-end: 3;

    background-color: $content-bg-color;
    padding: 0em 1em;
  }

  aside {
    grid-column-start: 4;
    grid-column-end: 5;

    grid-row-start: 2;
    grid-row-end: 3;

    background-color: $header-bg-color;
    border-left: 1px solid $workspace-separator-color;
  }

  footer {
    grid-column-start: 1;
    grid-column-end: 5;

    grid-row-start: 3;
    grid-row-end: 4;

    background-color: purple;
  }
}
</style>
