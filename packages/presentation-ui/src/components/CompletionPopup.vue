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
import { defineComponent, ref, PropType, computed, watch } from 'vue'
import Icon from '@anticrm/platform-ui/src/components/Icon.vue'

import ui from '@anticrm/platform-ui'
import presentationCore from '@anticrm/presentation-core'
import { Class, Ref, VDoc } from '@anticrm/platform'
import { getCoreService } from '../utils'
import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.vue'
import { CompletionItem } from '../index'

function getFirst(items: CompletionItem[]): CompletionItem {
  return (items.length > 0 ? items[0] : { key: '' }) as CompletionItem
}

export default defineComponent({
  components: { Icon, ScrollView },
  props: {
    items: Array as PropType<Array<CompletionItem>>,
    pos: Object as PropType<{ left: number; right: number; top: number; bottom: number }>
  },
  setup(props, context) {
    let listElement = ref(null as HTMLElement)
    let selElement = ref(null as HTMLElement)
    let selection = ref(getFirst(props.items))

    let selOffset = computed(() => {
      if (selElement.value != null) {
        let pp = selElement.value.parentElement
        return pp.offsetTop// + pp.clientHeight
      }
      return -1
    })

    function selectItem(item: string) {
      context.emit('select', item)
    }

    let popupStyle = computed(() => {
      return `left: ${props.pos.left + 5}px; top: ${props.pos.top - 80}px;`
    })

    watch(() => props.items, content => {

      let cs = props.items.find((e) => e.key == selection.value.key)
      if (cs == null) {
        // Filtering caused selection to be wrong, select first
        selection.value = getFirst(props.items)
      }
    })

    return {
      selectItem,
      popupStyle,
      listElement,
      selElement,
      selOffset,
      selection,
      handleUp() {
        let pos = props.items.indexOf(selection.value)
        if (pos > 0) {
          selection.value = props.items[pos - 1]
        }
      },
      handleDown() {
        let pos = props.items.indexOf(selection.value)
        if (pos < props.items.length - 1) {
          selection.value = props.items[pos + 1]
        }
      },
      handleSubmit() {
        context.emit('select', selection.value)
      }
    }
  }
})

</script>

<template>
  <div class="presentation-completion-popup" :style="popupStyle">
    <ScrollView style="height:100%;width: 100%;" ref="listElement" :scrollPosition="selOffset">
      <div
        v-for="item in items"
        class="item"
        :key="item.key"
        :class="{'selected': item.key == selection.key }"
        @click.prevent="selectItem(item.key)"
      >
        <div
          class="focus-placeholder"
          v-if="item.key== selection.key"
          ref="selElement"
          style="width:0px"
        ></div>
        {{ item.title ?? item.label }}
      </div>
    </ScrollView>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.presentation-completion-popup {
  display: flex;
  flex-direction: column;
  background-color: $input-color;
  color: #fff;
  position: absolute;
  border: 1px solid $content-color-dark;
  border-radius: 3px;
  height: 75px;
  width: 300px;

  .item {
    font-size: 14px;
    font-family: Raleway;
    white-space: no-wrap;
    width: 100%;

    &.selected {
      border-color: $highlight-color;
      background-color: darken($highlight-color, 30%);
      position: sticky;
    }

    &:focus {
      outline: none;
      border-color: $highlight-color;
      box-shadow: inset 0px 0px 2px 0px $highlight-color;
    }

    &:hover {
      border-color: $highlight-color;
      background-color: darken($highlight-color, 20%);
    }
  }
}
</style>
