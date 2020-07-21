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

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'
import { getPresentationUI } from '@anticrm/presentation-ui/src/utils'

export default defineComponent({
    components: { InlineEdit },
    props: {
      _class: {
        type: String as unknown as PropType<Ref<Class<Obj>>>,
        required: true
      },
    },
    setup(props) {
      const ui = getPresentationUI()
      return {model: ui.getClassModel(props)}
    }
  })
</script>

<template>
  <div style="margin-left: 1em" class="workbench-new-document">
    <div class="caption-4">Создаем: Рекрутинг/Кандидат</div>

    <table>
      <tr v-for="attr in model ? model.getOwnAttributes(_class) : []">
        <td class="label">{{attr.label}}</td>
        <td class="edit"><InlineEdit :placeholder="attr.placeholder"/></td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/css/_variables.scss";

  .workbench-new-document {

    .label {
      color: $content-color-dark;
    }

    .edit {
      /*font-family: 'IBM Plex Sans';*/
      /*font-size: 14px;*/
    }
  }
</style>