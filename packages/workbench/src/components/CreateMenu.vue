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
import { getCoreService } from '../utils'
import workbench, { WorkbenchCreateItem } from '..'

import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import { Class, Ref, VDoc } from '@anticrm/platform'

export default defineComponent({
  components: { Icon },
  props: {
    visible: Boolean
  },
  setup(props, context) {
    const coreService = getCoreService()
    const items = ref([] as WorkbenchCreateItem[])
    coreService.getModel().find(workbench.class.WorkbenchCreateItem, {}).then(i => items.value = i)

    function selectItem(_class: Ref<Class<VDoc>>) {
      context.emit('select', _class)
    }

    return { items, selectItem }
  }
})
</script>

<template>
  <div class="workbench-create-menu">
    <div class="content" :class="{show: visible}">
      <div v-for="item in items" class="item">
        <a href="#" @click.prevent="selectItem(item.itemClass)">{{ item.label }}</a>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.workbench-create-menu {
  position: relative;
  display: inline-block;

  .content {
    visibility: hidden;
    width: 300px;
    background-color: $input-color;
    border: 1px solid $content-color-dark;
    color: #fff;
    border-radius: 4px;
    padding: 1em;
    position: absolute;
    bottom: 125%;
    left: 50%;
    //margin-bottom: 2.5em;

    &.show {
      visibility: visible;
    }

    .item {
      font-size: 14px;
      font-family: Raleway;
    }
  }
}

</style>