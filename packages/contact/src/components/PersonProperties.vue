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
import StringPresenter from '@anticrm/presentation-ui/src/components/presenter/StringPresenter.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: { StringPresenter, OwnAttributes, Button },
  props: {
    _class: {
      type: String as unknown as PropType<Ref<Class<VDoc>>>,
      required: true
    },
    object: Object
  },
  setup (props, context) {
    const presentationCore = getPresentationCore()
    const ui = getPresentationUI()

    const NAME = 'name'
    const name = ref(presentationCore.getEmptyAttribute(props._class))

    const model = ui.getClassModel(props, model => {
      name.value = model.getAttribute(NAME)
      return model.filterAttributes([NAME])
    })

    return {
      model,
      name,
    }
  }
})
</script>

<template>
  <div class="contact-person-properties">
    <div>
      <StringPresenter class="caption-1" :attribute="name" v-model="object[name.key]" />
    </div>

    <div class="attributes">
      <OwnAttributes
        class="group"
        v-for="group in model.getGroups()"
        :_class="group._class"
        :model="model"
        :object="object"
        :key="group._class"
      ></OwnAttributes>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.contact-person-properties {
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
