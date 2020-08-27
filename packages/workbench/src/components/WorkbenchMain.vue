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

import Home from './Home.vue'

import { getCoreService, getUIService } from '../utils'
import workbench, { Application } from '../..'
import { Location } from '@anticrm/platform-ui'

import { Doc } from '@anticrm/platform'


export default defineComponent({
  components: { Home },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true
    }
  },
  setup (props) {
    const coreService = getCoreService()
    const model = coreService.getModel()
    const apps = ref([] as Application[])

    const component = computed(() => (model.get(props.location.path[0] as Ref<Doc>) as Application).main)

    return { component }
  }

})
</script>

<template>
  <div class="workbench-workbench-main">
    <widget :component="component" :location="location" />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-workbench-main {
  height: 100%;
}
</style>
