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
import { computed, defineComponent, PropType, ref } from 'vue'

import Nav from './nav/Nav.vue'
import Home from './Home.vue'
import InputControl from './InputControl.vue'
import DetailsForm from './DetailsForm.vue'

import { getCoreService, getUIService } from '../utils'
import workbench, { Application } from '../..'
import { Location } from '@anticrm/platform-ui'

import { Doc } from '@anticrm/platform'


export default defineComponent({
  components: { Nav, Home, InputControl, DetailsForm },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true
    }
  },
  setup (props) {
    const apps = ref([] as Application[])
    const coreService = getCoreService()
    coreService.getModel().find(workbench.class.Application, {}).then(docs => {
      apps.value = docs as Application[]
    })

    const app = computed(() => props.location.path[0])

    function currentApp(): Application | undefined {
      for (const application of apps.value) {
        if (application._id === app.value) {
          return application
        }
      }
    }

    const appClass = computed(() => {
      if (props.location.path.length >= 2) {
        return props.location.path[1]
      }
      return currentApp()?.appClass || null
    })

    const mainComponent = computed(() => {
      if (props.location.path.length >= 3) {
        return props.location.path[2]
      }
      return currentApp()?.main || ''
    })

    const uiService = getUIService()

    function navigateApp (app: Application) {
      uiService.navigate(uiService.toUrl({app: undefined, path: [app._id]}))
    }

    const details = ref<Doc | null>(null)

    function open (object: Doc) {
      console.log('open')
      details.value = object
    }

    function done () {
      details.value = null
    }

    return { apps, app, appClass, mainComponent, navigateApp, open, done, details }
  }

})
</script>

<template>
  <div id="workbench">
    <!--    <header>-->
    <!--      <div/>-->
    <!--      &lt;!&ndash;      <Header/>&ndash;&gt;-->
    <!--    </header>-->

    <nav>
      <!-- <Sidenav :applications="applications" /> -->
      <Nav :apps="apps"
           :current="app"
           @navigate="navigateApp"
      />
    </nav>

    <main>
      <widget v-if="appClass"
              :component="mainComponent"
              :_class="appClass"
              @open="open"
      />
      <Home v-else/>
    </main>

    <div class="input">
      <InputControl/>
    </div>

    <aside>
      <DetailsForm v-if="details" :object="details" @done="done"/>
    </aside>

    <!--    <footer></footer>-->
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

#workbench {
  display: grid;

  grid-template-columns: $pictogram-size 1fr auto;
  //grid-template-rows: $pictogram-size 1fr 24px;
  grid-template-rows: 1fr auto;

  height: 100%;

  header {
    grid-column-start: 1;
    grid-column-end: 4;

    grid-row-start: 1;
    grid-row-end: 2;

    background-color: $header-bg-color;
    border-bottom: 1px solid $workspace-separator-color;
  }

  nav {
    grid-column-start: 1;
    grid-column-end: 2;

    grid-row-start: 1;
    grid-row-end: 3;

    background-color: $nav-bg-color;
  }

  main {
    grid-column-start: 2;
    grid-column-end: 3;

    grid-row-start: 1;
    grid-row-end: 2;

    //background-color: $header-bg-color;
    background-color: $content-bg-color;
    padding: 0em 1em;
    width: 80em;
  }

  .input {
    grid-column-start: 2;
    grid-column-end: 3;

    grid-row-start: 2;
    grid-row-end: 3;

    padding: 1.5em;
  }

  aside {
    grid-column-start: 3;
    grid-column-end: 4;

    grid-row-start: 1;
    grid-row-end: 3;

    background-color: $header-bg-color;
    //background-color: $content-bg-color;
    border-left: 1px solid $workspace-separator-color;
  }

  footer {
    grid-column-start: 1;
    grid-column-end: 4;

    grid-row-start: 3;
    grid-row-end: 4;

    background-color: purple;
  }
}
</style>
