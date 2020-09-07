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

import { defineComponent, PropType, ref, watch, onUnmounted } from 'vue'
import { Class, DeleteTx, PushTx, Doc, generateId, Property, Ref, VDoc } from '@anticrm/platform'
import presentationCore from '@anticrm/presentation-core'

import { getCoreService, getPresentationCore } from '../utils'
import core from '@anticrm/platform-core'

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
    _id: {
      type: String as unknown as PropType<Ref<VDoc>>,
      required: true
    }
  },
  setup (props, context) {
    const coreService = getCoreService()
    const presentationCoreService = getPresentationCore()

    const component = ref('')

    const comment = ref('')

    let shutdown: any = null

    const object = ref(null)

    watch(() => props._id, _id => {
      if (shutdown) { shutdown() }
      shutdown = coreService.query(props._class, { _id }, (result: Doc[]) => {
        console.log('object query: ', result)
        object.value = result[0]
      })

      component.value = presentationCoreService.getComponentExtension(props._class, presentationCore.class.DetailForm)
    }, { immediate: true })

    onUnmounted(() => shutdown())

    function cancel () {
      context.emit('done', 'cancel')
    }

    function remove () {
      const tx: DeleteTx = {
        _class: core.class.DeleteTx,
        _id: generateId() as Ref<Doc>,

        _objectId: props._id as Ref<VDoc>,
        _objectClass: props._class as Ref<Class<VDoc>>,
        _date: Date.now() as Property<number, Date>,
        _user: 'andrey.v.platov@gmail.com' as Property<string, string>,
      }

      coreService.tx(tx)

      context.emit('done', 'delete')
    }

    function submit () {
      console.log(comment.value)
      const tx: PushTx = {
        _class: core.class.PushTx,
        _id: generateId() as Ref<Doc>,

        _objectId: props._id as Ref<VDoc>,
        _objectClass: props._class as Ref<Class<VDoc>>,
        _date: Date.now() as Property<number, Date>,
        _user: 'andrey.v.platov@gmail.com' as Property<string, string>,

        _attribute: 'comments' as Property<string, string>,
        _attributes: {
          message: comment.value as Property<string, string>
        }
      }

      coreService.tx(tx)
      comment.value = ''
    }

    return {
      component,
      object,

      cancel,
      remove,

      comment,
      submit
    }
  }
})
</script>

<template>
  <div class="recruiting-view">
    <div v-if="object !== null">
      <div class="header">
        <div class="actions">
          <Button @click="cancel">Cancel</Button>
          <Button @click="remove">Delete</Button>
        </div>
      </div>

      <div class="content">
        <widget v-if="component !== ''" :component="component" :object="object" :_class="_class" />
      </div>

      <div class="comments">
        <div class="caption-2">Комментарии</div>
        <div>
          <InlineEdit placeholder="Comment..." v-model="comment" />
          <Button class="submit" @click="submit">Submit</Button>
        </div>
        <div v-for="(comment, index) in object.comments" :key="index">{{comment.message}}</div>
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

  .comments {
    .submit {
      font-size: 10px;
      margin-left: 1em;
    }
  }

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
