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

import { getPresentationUI } from '@anticrm/presentation-ui/src/utils'
import { getPresentationCore } from '../utils'

import OwnAttributes from '@anticrm/presentation-ui/src/components/OwnAttributes.vue'
import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'

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
    const firstName = ref(core.getEmptyAttribute(props._class))
    const lastName = ref(core.getEmptyAttribute(props._class))

    const ui = getPresentationUI()
    const model = ui.getClassModel(props, model => {
      firstName.value = model.getAttribute('firstName')
      lastName.value = model.getAttribute('lastName')
      return model.filterAttributes(['firstName', 'lastName'])
    })
    return {
      model,
      firstName,
      lastName
    }
  }
})
</script>

<template>
  <div class="recruiting-view">
    <div class="caption-4">Найм / Новый кандидат</div>

    <div class="content">
      <InlineEdit class="caption-1" :placeholder="firstName.placeholder"/>
      <InlineEdit class="caption-2" :placeholder="lastName.placeholder"/>

      <div class="attributes">
        <OwnAttributes class="group" v-for="group in model.getGroups()" :_class="group._class" :model="model"></OwnAttributes>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.recruiting-view {

  margin: 1em;

  .content {
    margin: 1em;
  }

  .attributes {
    display: flex;
    flex-wrap: wrap;

    //display: grid;
    //background-color: $content-color-dark;
    //grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    //grid-gap: 1px;

    margin-top: 1em;

    .group {
      padding: 0.5em;
      //background-color: $content-bg-color;
    }
  }
}
</style>
