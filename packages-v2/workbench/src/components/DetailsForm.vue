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
import { Class, DeleteTx, Doc, generateId, Property, Ref, VDoc } from '@anticrm/platform'
import presentationCore from '@anticrm/presentation-core'

import { getCoreService } from '@anticrm/workbench/src/utils'
import core from '@anticrm/platform-core'

import OwnAttributes from '@anticrm/presentation-ui/src/components/OwnAttributes.vue'
import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: { InlineEdit, OwnAttributes, Button },
  props: {
    object: {
      type: Object as PropType<VDoc>,
      required: true
    }
  },
  setup(props, context) {
    const coreService = getCoreService()
    const model = coreService.getModel()
    const clazz = model.get(props.object._class) as Class<VDoc>

    const component = ref('')
    const _class = ref('')

    if (model.isMixedIn(clazz, presentationCore.class.DetailsForm)) {
      const detailsForm = model.as(clazz, presentationCore.class.DetailsForm)
      component.value = detailsForm.form
      _class.value = clazz._id
    }

    function cancel() {
      context.emit('done', 'cancel')
    }

    function remove() {
      const tx: DeleteTx = {
        _class: core.class.DeleteTx,
        _id: generateId() as Ref<Doc>,

        _objectId: props.object._id as Ref<VDoc>,
        _objectClass: props.object._class as Ref<Class<VDoc>>,
        _date: Date.now() as Property<number, Date>,
        _user: 'andrey.v.platov@gmail.com' as Property<string, string>,
      }

      coreService.tx(tx)

      context.emit('done', 'delete')
    }

    return {
      component,
      _class,
      cancel,
      remove
    }
  }
})
</script>

<template>
  <div class="recruiting-view">
    <div class="header">
      <div class="caption-4">Найм / Новый кандидат</div>
      <div class="actions">
        <Button @click="cancel">Cancel</Button>
        <Button @click="remove">Delete</Button>
      </div>
    </div>

    <div class="content">
      <widget v-if="component !== ''" :component="component" :object="object" :_class="_class"/>
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
