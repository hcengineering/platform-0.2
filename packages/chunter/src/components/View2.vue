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
import { Class, Ref, VDoc } from '@anticrm/platform'

import { getPresentationUI } from '@anticrm/presentation-ui/src/utils'
import { getPresentationCore } from '../utils'

import OwnAttributes from '@anticrm/presentation-ui/src/components/OwnAttributes.vue'
import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: { InlineEdit, OwnAttributes, Button },
  props: {
    _class: {
      type: String as unknown as PropType<Ref<Class<VDoc>>>,
      required: true
    },
    object: Object
  },
  setup(props, context) {
    const presentationCore = getPresentationCore()
    const firstName = ref(presentationCore.getEmptyAttribute(props._class))
    const lastName = ref(presentationCore.getEmptyAttribute(props._class))

    const ui = getPresentationUI()
    const model = ui.getClassModel(props, model => {
      const aFirstName = model.getAttribute('firstName')
      if (aFirstName)
        firstName.value = aFirstName
      const aLastName = model.getAttribute('lastName')
      if (aLastName)
        lastName.value = aLastName
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
    <div class="recruiting-view2">
      <InlineEdit class="caption-1" :placeholder="firstName.placeholder"/>
      <InlineEdit class="caption-2" :placeholder="lastName.placeholder"/>

      <div class="attributes">
        <OwnAttributes class="group" v-for="group in model.getGroups()" :_class="group._class" :model="model" :object="object"></OwnAttributes>
      </div>

    </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.recruiting-view2 {

  .attributes {
    display: flex;
    flex-wrap: wrap;

    margin-top: 1em;

    .group {
      padding: 0.5em;
    }
  }
}
</style>
