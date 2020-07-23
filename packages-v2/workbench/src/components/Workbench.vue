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
import { computed, defineComponent, ref } from 'vue'

import Nav from './nav/Nav.vue'
import Home from './Home.vue'
import { getCoreService, getUIService } from '../utils'
import workbench, { Application } from '../..'
import { Class, Ref, VDoc } from '@anticrm/platform'
import { AnyComponent } from '@anticrm/platform-ui'

import View from '@anticrm/recruitment/src/components/View.vue'

interface PanelConfig {
    app: Ref<Application>
    component: AnyComponent
  }

  interface WorkbenchConfig {
    panels: PanelConfig[]
    currentPanel: number
  }

  export default defineComponent({
    components: {Nav, Home, View},
    props: {
      location: {
        type: Object,
        required: true,
      },
      params: Object
    },
    setup(props) {
      const apps = ref([] as Application[])

      const coreService = getCoreService()
      coreService.getModel().find(workbench.class.Application, {}).then(docs => {
        apps.value = docs as Application[]
      })

      const uiService = getUIService()

      function getAppClass(application: string): Ref<Class<VDoc>> {
        for (const app of apps.value) {
          if (app._id === application) {
            return app.appClass
          }
        }
        return '' as Ref<Class<VDoc>>
      }

      /**
       * Translate application-agnostic path into workbench config.
       * @param path
       */
      function parsePath(path: string[]): WorkbenchConfig {
        const panels = [] as PanelConfig[]
        for (const p of path) {
          const split = p.split('!')
          const app = split[0]
          const component = split.length > 1 ? split[1] : workbench.component.Browse
          panels.push({app: app as Ref<Application>, component: component as AnyComponent})
        }
        return { panels, currentPanel: panels.length - 1 }
      }

      const config = computed(() => parsePath(props.location.path))

      function toLocation(config: WorkbenchConfig) {
        const path = [] as string[]
        for (const panel of config.panels) {
          path.push(panel.app + '!' + panel.component)
        }
        return { app: undefined, path }
      }

      function navigateApp(app: Application) {
        const newConfig = { ...config.value }
        const component = workbench.component.Browse
        if (newConfig.currentPanel >= 0) {
          newConfig.panels[newConfig.currentPanel] = { app: app._id as Ref<Application>, component }
        } else {
          newConfig.panels.push({ app: app._id as Ref<Application>, component })
          newConfig.currentPanel = 0
        }
        uiService.navigate(uiService.toUrl(toLocation(newConfig)))
      }

      function navigatePanel(component: AnyComponent) {
        const newConfig = { ...config.value }
        newConfig.panels[newConfig.currentPanel].component = component
        uiService.navigate(uiService.toUrl(toLocation(newConfig)))
      }

      return {apps, config, navigateApp, navigatePanel, getAppClass}
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
           :current="config.currentPanel < 0 ? '' : config.panels[config.currentPanel].app"
           @navigate="navigateApp"
      />
    </nav>

    <main>
      <div v-if="config.currentPanel >= 0">

      </div>
      <widget v-if="config.currentPanel >= 0" :component="config.panels[0].component"
              :_class="getAppClass(config.panels[0].app)"
              @navigate="navigatePanel"
      />
      <Home v-else/>
    </main>

    <aside>
      <View _class="class:recruitment.Candidate" />
    </aside>

<!--    <footer></footer>-->
  </div>
</template>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/css/_variables.scss";

  #workbench {
    display: grid;

    grid-template-columns: $pictogram-size 1fr 36em;
    //grid-template-rows: $pictogram-size 1fr 24px;
    grid-template-rows: 1fr;

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
      grid-row-end: 2;

      background-color: $nav-bg-color;
    }

    main {
      grid-column-start: 2;
      grid-column-end: 3;

      grid-row-start: 1;
      grid-row-end: 2;

      //background-color: $header-bg-color;
      background-color: $content-bg-color;
      // padding: 0em 1em;
    }

    aside {
      grid-column-start: 3;
      grid-column-end: 4;

      grid-row-start: 1;
      grid-row-end: 2;

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
