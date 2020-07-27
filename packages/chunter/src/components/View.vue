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

import { defineComponent, PropType, reactive, ref } from 'vue'
import { Class, CreateTx, Doc, generateId, Property, Ref, VDoc } from '@anticrm/platform'

import core from '@anticrm/platform-core'

import { getPresentationUI } from '@anticrm/presentation-ui/src/utils'
import { getPresentationCore } from '../utils'
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
  },
  setup(props, context) {
    const coreService = getCoreService()

    const presentationCore = getPresentationCore()
    const firstName = ref(presentationCore.getEmptyAttribute(props._class))
    const lastName = ref(presentationCore.getEmptyAttribute(props._class))

    const ui = getPresentationUI()
    // const model = ref(presentationCore.getEmptyModel())
    const model = ui.getClassModel(props, model => {
      const aFirstName = model.getAttribute('firstName')
      if (aFirstName)
        firstName.value = aFirstName
      const aLastName = model.getAttribute('lastName')
      if (aLastName)
        lastName.value = aLastName
      return model.filterAttributes(['firstName', 'lastName'])
    })

    const object = reactive({})

    function save() {
      const objectId = generateId() as Ref<VDoc>

      const tx: CreateTx = {
        _class: core.class.CreateTx,
        _id: generateId() as Ref<Doc>,

        _objectId: objectId,
        _objectClass: props._class,

        _date: Date.now() as Property<number, Date>,
        _user: 'andrey.v.platov@gmail.com' as Property<string, string>,

        _attributes: { ...object }
      }

      coreService.tx(tx)
    }

    function cancel() {
      context.emit('open', {
        component: '',
        document: ''
      })
    }

    return {
      object,
      save,
      cancel,
      model,
      firstName,
      lastName
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
        <Button @click="save">Save</Button>
      </div>
    </div>

    <div class="content">
      <InlineEdit class="caption-1" :placeholder="firstName.placeholder"/>
      <InlineEdit class="caption-2" :placeholder="lastName.placeholder"/>

      <div class="attributes">
        <OwnAttributes class="group" v-for="group in model.getGroups()" :_class="group._class" :model="model" :object="object"></OwnAttributes>
      </div>

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
