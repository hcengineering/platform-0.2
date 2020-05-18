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

<template>
  <div id="workbench">
    <header>
      <!-- <Header @add="addObject()" /> -->
    </header>

    <nav>
      <!-- <Sidenav :applications="applications" /> -->
    </nav>

    <main>
<!--      <widget component="component:ui.Icon"/>-->
    </main>

    <aside>
      <!-- <FormEditor v-if="leftPane" :object="leftPane" @save="onSave()"></FormEditor> -->
    </aside>

    <footer></footer>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/platform-ui-theme/css/_variables.scss";

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
