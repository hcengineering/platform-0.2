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

export default defineComponent({
  setup (props) {
    const coreService = getCoreService()
    const model = coreService.getModel()

    const spaces = ref<Doc[]>([])
    model.find(core.class.Space, {}).then(s => spaces.value = model.cast(s, ui.mixin.UXObject))
    return {
      spaces
    }
  }
})
</script>

<template>
  <div class="workbench-projects">
    <!-- <div class="caption-3">Запрос</div>
    <div class="project">Хитромудрый запрос по бд `Контакт`</div>-->

    <div class="caption-3">Пространства</div>
    <div v-for="space in spaces" :key="space._id" class="project">
      <a href="#" @click.prevent="$emit('navigate', space._id)">#{{space.label}}</a>
    </div>

    <div class="caption-3">Тип</div>
    <div class="project">Контакт</div>
    <div class="project">Задача</div>
    <div class="project">Кандидат</div>
    <div class="project">Интервью</div>
  </div>
</template>

<style lang="scss">
.workbench-projects {
  .project {
    font-family: Raleway;
    margin: 0.5em;

    a {
      text-decoration: none;
    }
  }
}
</style>