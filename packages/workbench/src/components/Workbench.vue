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
import { Ref } from '@anticrm/platform'

import Nav from './nav/Nav.vue'
import InputControl from './InputControl.vue'

import { getCoreService, getUIService } from '../utils'
import workbench, { Application } from '../..'
import { Location } from '@anticrm/platform-ui'

import { Doc } from '@anticrm/platform'
import Spotlight from './Spotlight.vue'

export default defineComponent({
  components: { Nav, InputControl, Spotlight },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true
    }
  },
  setup (props) {
    const coreService = getCoreService()
    const model = coreService.getModel()

    const app = computed(() => props.location.path[0])
    const perspective = computed(() => (model.get(props.location.path[0] as Ref<Doc>) as Application).main)

    const uiService = getUIService()

    function navigateApp (app: Application) {
      uiService.navigate(uiService.toUrl({ app: undefined, path: [app._id] }))
    }

    return { app, navigateApp, perspective }
  }

})
</script>

<template>
  <div id="workbench">
    <nav>
      <Nav :current="app" @navigate="navigateApp" />
    </nav>

    <main>
      <!-- <WorkbenchMain :location="location" /> -->
      <widget :component="perspective" :location="location" />
    </main>

    <Spotlight />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

#workbench {
  display: flex;
  height: 100%;

  nav {
    width: $pictogram-size;
    background-color: $nav-bg-color;
  }

  main {
    background-color: $content-bg-color;
    width: 100%;
  }
}
</style>
