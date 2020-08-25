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
import { Doc } from '@anticrm/platform'
import { getCoreService } from '../utils'
import core from '@anticrm/platform-core'
import ui from '@anticrm/presentation-core'
import workbench, { WorkbenchCreateItem } from '..'

export default defineComponent({
  props: {
    space: String,
    type: String
  },
  setup (props) {
    const coreService = getCoreService()
    const model = coreService.getModel()

    const spaces = ref<Doc[]>([])
    model.find(core.class.Space, {}).then(s => spaces.value = model.cast(s, ui.mixin.UXObject))

    const types = ref<WorkbenchCreateItem[]>([])
    coreService.getModel().find(workbench.class.WorkbenchCreateItem, {}).then(i => types.value = i)

    return {
      spaces,
      types,
    }
  }
})
</script>

<template>
  <div class="workbench-projects">
    <div class="caption-3">Пространства</div>
    <div class="project" :class="{selected: !space}">
      <a href="#" @click.prevent="$emit('navigate', undefined)">Все</a>
    </div>
    <div v-for="s in spaces" :key="s._id" class="project" :class="{selected: s._id === space}">
      <a href="#" @click.prevent="$emit('navigate', s._id)">#{{s.label}}</a>
    </div>

    <div class="caption-3">Тип</div>
    <div class="project">
      <a href="#" @click.prevent="$emit('update:type', undefined)">Все</a>
    </div>
    <div v-for="type in types" :key="type._id" class="project">
      <a href="#" @click.prevent="$emit('update:type', type.itemClass)">{{type.label}}</a>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-projects {
  .project {
    font-family: Raleway;
    margin: 0.5em;

    &.selected {
      color: $content-bg-color;
      background-color: $content-color-dark;
    }

    a {
      text-decoration: none;
    }
  }
}
</style>