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

import { defineComponent, PropType } from 'vue'
import { Class, Obj, Ref } from '@anticrm/platform'

import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'

import { ClassModel } from '@anticrm/presentation-core'

export default defineComponent({
  components: { InlineEdit, Icon },
  props: {
    _class: {
      type: String as unknown as PropType<Ref<Class<Obj>>>,
      required: true
    },
    model: {
      type: Object as PropType<ClassModel>
    },
    object: {
      type: Object
    }
  },
  setup (props) {
    function update (event: { key: string, value: string }) {
      console.log(event)
      props.object[event.key] = event.value
    }

    return { update }
  }
})
</script>

<template>
  <div class="presentation-ui-own-attributes">
    <div class="caption-4">{{ model.getGroup(_class).label }}</div>
    <table>
      <tr v-for="attr in model.getOwnAttributes(_class)" :key="attr.key">
        <td>
          <Icon :icon="attr.icon" class="icon-embed-15x icon" />
        </td>
        <td width="120px">
          <div class="label">{{ attr.label }}</div>
        </td>
        <td>
          <div class="edit">
            <widget
              :component="attr.presenter"
              :attributeKey="attr.key"
              :value="object[attr.key]"
              :placeholder="attr.placeholder"
              :type="attr.type"
              @update="update"
            />
            <!--            <InlineEdit :placeholder="attr.placeholder"/>-->
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.presentation-ui-own-attributes {
  .icon {
    fill: $content-color-dark;
  }

  .label {
    color: $content-color-dark;
  }

  .edit {
    font-family: Raleway;
    font-size: 14px;
  }
}
</style>
