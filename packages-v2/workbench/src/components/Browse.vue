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

import presentation from '@anticrm/presentation-core'
import workbench from '..'

import Table from '@anticrm/presentation-ui/src/components/Table.vue'
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'
import { getCoreService } from '../utils'
import { Class, Ref, VDoc } from '@anticrm/platform'

export default defineComponent({
    components: {
      Table,
      Icon
    },
    props: {
      _class: {
        type: String as unknown as PropType<Ref<Class<VDoc>>>,
        required: true
      }
    },
    setup(props) {
      const coreService = getCoreService()
      const model = coreService.getModel()

      function add() {
        const clazz = model.get(props._class) as Class<VDoc>
        const details = model.as(clazz, presentation.class.DetailsForm)
        this.$emit('navigate', details.form || workbench.component.NewDocument)
      }
      return { workbench, add }
    }
  })
</script>

<template>
  <div>
    <div>
      <span class="caption-1">{{_class}}</span>&nbsp;
      <a href="#" @click.prevent="add"><Icon :icon="workbench.icon.Add" class="icon-embed-2x"/></a>
    </div>
    <Table :_class="_class" />
  </div>
</template>
