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

import Vue, { PropType } from 'vue'

import { Obj, Ref, Class } from '@anticrm/platform-core'

import ui, { UIPlugin, AttrModel } from '@anticrm/platform-ui'
import InlineEdit from '@anticrm/platform-ui-controls/src/InlineEdit.vue'
import Icon from './Icon.vue'

export default Vue.extend({
  components: { InlineEdit, Icon },
  props: {
    clazz: Object as PropType<Ref<Class<Obj>>>,
    objects: Object as PropType<Promise<Obj[]>>,
    filter: Array as PropType<string[] | undefined>,
  },
  data() {
    return {
      model: [],
      content: []
    }
  },
  created() {
    this.$platform.getPlugin(ui.id).then(plugin => {
      plugin.getAttrModel(this.clazz, this.filter)
        .then(result => this.model = result)
    })
    this.objects.then(obj => this.content = obj)
  }
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
@import "~@anticrm/platform-ui-theme/css/_variables.scss";

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
