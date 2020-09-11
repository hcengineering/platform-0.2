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

export default defineComponent({
  components: { StringPresenter, OwnAttributes },
  props: {
    _class: {
      type: String as unknown as PropType<Ref<Class<VDoc>>>,
      required: true
    },
    object: Object
  },
  setup (props) {
    const presentationCore = getPresentationCore()
    const ui = getPresentationUI()

    const TITLE = 'title'
    const title = ref(presentationCore.getEmptyAttribute(props._class))

    const model = ui.getClassModel(props, model => {
      title.value = model.getAttribute(TITLE)
      return model.filterAttributes([TITLE])
    })

    return {
      model,
      title
      // onChange (key: string, value: string) {
      //   console.log('key-value', key, value)
      //   coreService.tx()
      // }
    }
  }
})
</script>

<template>
  <div class="chunter-page-properties">
    <div>
      <StringPresenter
        class="caption-1"
        :attribute="title"
        :modelValue="object[title.key]"
        @update:modelValue="$emit('update', title.key, $event)"
      />
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

.chunter-page-properties {
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
