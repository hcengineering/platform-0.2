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
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import { Ref, Doc, Space } from '@anticrm/platform'

import { getCoreService, getUIService } from '../utils'
import workbench, { Application } from '../..'
import { Location } from '@anticrm/platform-ui'

import Projects from './Projects.vue'
import InputControl from './InputControl.vue'
import DetailsForm from './DetailsForm.vue'

import presentationUI from '@anticrm/presentation-ui'
import chunter from '@anticrm/chunter'

export default defineComponent({
  components: { Projects, InputControl, DetailsForm },
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
    const project = computed(() => props.location.path[1])

    const type = ref('')
    const component = computed(() => type.value ? presentationUI.component.BrowseView : chunter.component.ChunterView)

    // watch(() => props.location, location => {
    //   const space = model.get(location.path[1] as Ref<Space>)
    //   const spaceExtension = model.as(space, workbench.mixin.SpaceExtension)
    //   component.value = spaceExtension.component
    // }, { immediate: true })

    const uiService = getUIService()
    function navigate (project: Ref<Doc>) {
      uiService.navigate(uiService.toUrl({ app: undefined, path: [app.value, project] }))
    }

    const details = ref<Doc | null>(null)

    function open (object: Doc) {
      console.log('open')
      details.value = object
    }

    function done () {
      details.value = null
    }

    return { project, component, navigate, type, details, open, done }
  }

})
</script>

<template>
  <div class="workbench-perspective">
    <div class="projects">
      <Projects @navigate="navigate" :space="project" v-model:type="type" />
    </div>
    <div class="main">
      <widget :_class="type" :space="space" :component="component" @open="open" />
      <InputControl />
    </div>

    <aside>
      <DetailsForm v-if="details" :object="details" @done="done" />
    </aside>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-perspective {
  display: flex;
  height: 100%;

  .projects {
    padding: 1em;
    width: 20em;

    border-right: 1px solid $workspace-separator-color;
  }

  .main {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  aside {
    background-color: $header-bg-color;
    border-left: 1px solid $workspace-separator-color;
  }
}
</style>
