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

import { defineComponent, PropType, ref } from 'vue'
import { Class, Obj, Ref } from '@anticrm/platform'

import OwnAttributes from '@anticrm/presentation-ui/src/components/OwnAttributes.vue'
import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'
import { getPresentationUI } from '@anticrm/presentation-ui/src/utils'
import { getPresentationCore } from '../utils'

export default defineComponent({
  components: { InlineEdit, OwnAttributes },
  props: {
    _class: {
      type: String as unknown as PropType<Ref<Class<Obj>>>,
      required: true
    },
  },
  setup(props) {
    const core = getPresentationCore()
    const title = ref(core.getEmptyAttribute(props._class))

    const ui = getPresentationUI()
    const model = ui.getClassModel(props, model => {
      title.value = model.getAttribute('title')
      return model.filterAttributes(['title'])
    })
    return {
      model,
      title
    }
  }
})
</script>

<template>
  <div class="task-view">
    <div class="caption-4">Задачи / Новая задача</div>

    <div class="content">

      <div class="caption-1">КАНД-213</div>
      <InlineEdit class="caption-2" :placeholder="title.placeholder"/>

<!--      <div v-for="group in model.getGroups()" :_class="group._class" :model="model">{{group._class}}</div>-->

    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.task-view {

  margin: 1em;

  .content {
    margin: 1em;
  }
}
</style>