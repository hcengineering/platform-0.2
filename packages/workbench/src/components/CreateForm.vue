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

import { defineComponent, PropType, reactive } from 'vue'
import { Class, CreateTx, Doc, generateId, Property, Ref, VDoc } from '@anticrm/platform'

import core from '@anticrm/platform-core'

import { getCoreService } from '@anticrm/workbench/src/utils'

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
    title: {
      type: String,
      required: true
    },
    component: {
      type: String,
      required: true
    }
  },
  setup (props, context) {
    const coreService = getCoreService()

    const object = reactive({})

    function save () {
      coreService.createVDoc(props._class, object)
      context.emit('done', 'save')
    }

    function cancel () {
      context.emit('done', 'cancel')
    }

    return {
      object,
      save,
      cancel,
    }
  }
})
</script>

<template>
  <div class="recruiting-view">
    <div class="header">
      <div class="caption-4">{{title}}</div>
      <div class="actions">
        <Button @click="cancel">Cancel</Button>
        <Button @click="save">Save</Button>
      </div>
    </div>

    <div class="content">
      <widget :component="component" :object="object" :_class="_class" />
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.recruiting-view {
  margin: 1em;

  .header {
    display: flex;

    .actions {
      display: flex;
      flex-grow: 1;
      flex-direction: row-reverse;
      font-size: 10px;

      button {
        margin-left: 0.5em;
      }
    }
  }

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
