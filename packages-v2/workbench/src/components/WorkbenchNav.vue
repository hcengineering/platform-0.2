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
import { computed, defineComponent, PropType, reactive, ref } from 'vue'

import Nav from './nav/Nav.vue'
import Home from './Home.vue'
import InputControl from './InputControl.vue'

import { getCoreService, getUIService } from '../utils'
import workbench, { Application } from '../..'
import { AnyComponent, Location } from '@anticrm/platform-ui'

import View from '@anticrm/recruitment/src/components/View.vue'

export default defineComponent({
  components: { Nav, Home, View, InputControl },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true
    }
  },
  setup (props) {
    const apps = ref([] as Application[])
    const app = computed(() => props.location.path[0])
    const appClass = computed(() => {
      if (props.location.path.length >= 2) {
        return props.location.path[1]
      }
      for (const a of apps.value) {
        if (a._id === app.value) {
          return a.appClass
        }
      }
      return ''
    })
    const component = computed(() => {
      if (props.location.path.length >= 3) {
        return props.location.path[2]
      }
      return workbench.component.Browse
    })

    const coreService = getCoreService()
    coreService.getModel().find(workbench.class.Application, {}).then(docs => {
      apps.value = docs as Application[]
    })

    const uiService = getUIService()

    function navigateApp (app: Application) {
      uiService.navigate(uiService.toUrl({app: undefined, path: [app._id]}))
    }

    function navigatePanel (component: AnyComponent) {
      uiService.navigate(uiService.toUrl({app: undefined, path: [app.value, appClass.value, component]}))
    }

    const details = reactive({
      component: '' as AnyComponent,
      object: '' as Object
    })

    function open (event: {component: AnyComponent, object: Object}) {
      details.component = event.component
      details.object = event.object
    }

    function done () {
      details.component = '' as AnyComponent
      details.object = {}
    }

    return { apps, app, appClass, component, navigateApp, navigatePanel, open, done, details }
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
      <widget v-if="appClass !== ''" :component="component"
              :_class="appClass"
              @open="open"
      />
      <Home v-else/>
    </main>

    <div class="input">
      <InputControl/>
    </div>

    <aside>
      <widget v-if="details.component !== ''" :component="details.component" :object="details.object" @done="done"/>
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
