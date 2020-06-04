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

import { defineComponent, PropType, inject } from 'vue'
import core, { Obj, Doc, Ref, Class, CoreService } from '@anticrm/platform-core'
import ui, { UIService } from '@anticrm/platform-ui'
import { injectPlatform } from '..'

export default defineComponent({
  components: {},
  props: {
    clazz: String as unknown as PropType<Ref<Class<Doc>>>,
    exclude: String as PropType<string[] | string>,
  },
  async setup (props) {
    const _ = await injectPlatform({ core: core.id, ui: ui.id })
    const coreService = _.deps.core
    const uiService = _.deps.ui
    const model = uiService.getAttrModel(props.clazz)
    const content = coreService.find(props.clazz, {})
    return {
      model: await model, content: await content
    }
  },
})
</script>

<template>
  <div class="erp-table">
    <div class="thead">
      <div class="tr">
        <div class="th caption-4" v-for="attr in this.model" :key="attr.key">{{ attr.label }}</div>
      </div>
    </div>
    <div class="tbody">
      <div class="tr" v-for="object in content" :key="object._id">
        <div class="td" v-for="attr in model" :key="attr.key">
          {{ object[attr.key] }}
          <!-- <component :is="getPresenters()[propertyKey]" :value="object[propertyKey]"></component> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.erp-table {
  display: table;
  border-collapse: collapse;

  .tr {
    display: table-row;
  }

  .thead {
    display: table-header-group;
  }

  .th {
    display: table-cell;
    padding: 0.5em;
  }

  .tbody {
    display: table-row-group;

    .tr {
      border-bottom: $border-default;
    }
  }

  .td {
    display: table-cell;
    padding: 0.5em;

    &.Boolean {
      text-align: center;
    }
  }

  .tfoot {
    display: table-footer-group;
  }
  .col {
    display: table-column;
  }
  .colgroup {
    display: table-column-group;
  }
  .caption {
    display: table-caption;
  }
}
</style>
