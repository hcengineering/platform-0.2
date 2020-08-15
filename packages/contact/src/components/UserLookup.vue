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

import { defineComponent, PropType, ref, watch, onMounted, onUnmounted } from 'vue'
import { Class, Ref, Doc } from '@anticrm/platform'

import { getPresentationUI } from '@anticrm/presentation-ui/src/utils'
import { getCoreService, getPresentationCore } from '../utils'

import { User } from '@anticrm/contact'

import contact from '..'

function startsWith (str: string | undefined, prefix: string) {
  return (str ?? '').startsWith(prefix)
}

export default defineComponent({
  props: {
    lookup: String,
    modelValue: String
  },
  setup (props, context) {
    const coreService = getCoreService()

    function name (user: User) {
      let result = ''
      if (user.firstName) {
        result = result + user.firstName
      }
      result = result + ' '
      if (user.lastName) {
        result = result + user.lastName
      }
      if (result === ' ')
        result = 'First Last' // first & last are never empty
      return result
    }

    // all = docs as User[]
    // TODO: id to display name
    // for (const user of all) {
    //   if (user._id === props.modelValue) {
    //     const displayName = user.displayName ?? name(user)
    //     context.emit('update:lookup', displayName)
    //   }
    // }
    const result = ref([] as Doc[])

    watch(() => props.lookup, prefix => {
      console.log('watch')
      coreService.find(contact.mixin.User, {}).then(docs => {
        const filtered = []
        let found = false
        const all = docs as User[]
        for (const value of all) {
          if (prefix ? startsWith(value.firstName, prefix) || startsWith(value.lastName, prefix) || startsWith(value.displayName, prefix) : true) {
            filtered.push(value)
            if (prefix === name(value) || prefix === value.displayName) {
              context.emit('update:modelValue', value._id)
              found = true
            }
          }
        }
        result.value = filtered
        if (!found) {
          context.emit('update:modelValue', undefined)
        }
      })
    }, { immediate: true })

    const selected = ref(0)

    function keydown (e: KeyboardEvent) {
      switch (e.code) {
        case 'ArrowUp':
          if (selected.value > 0) selected.value--
          e.preventDefault()
          break;
        case 'ArrowDown':
          if (selected.value < result.value.length - 1) selected.value++
          e.preventDefault()
          break
        case 'Enter':
          //context.emit('update:modelValue', result.value[selected.value]._id)
          const user = result.value[selected.value] as User
          if (user)
            context.emit('update:lookup', user.displayName ?? name(user))
          break
      }
    }

    onMounted(() => document.addEventListener('keydown', keydown))
    onUnmounted(() => document.removeEventListener('keydown', keydown))

    return {
      result,
      name,
      keydown,
      selected
    }
  }
})

</script>

<template>
  <div class="contact-user-lookup" v-show="result.length > 0 && modelValue === undefined">
    <div
      v-for="(doc, index) in result"
      :key="doc._id"
      class="item"
      @keydown="keydown"
      :class="{selected: index === selected}"
    >
      <b>{{name(doc)}}</b>
      <span v-if="doc.displayName">&nbsp;&dash; {{doc.displayName}}</span>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.contact-user-lookup {
  position: absolute;
  bottom: 100%;
  left: 100%;

  background-color: $input-color;
  border: 1px solid $content-color-dark;
  border-radius: 4px;

  padding: 0.5em;
  margin: 0;
  margin-bottom: 1.5em;

  .item {
    white-space: nowrap;

    &.selected {
      background-color: $content-bg-color;
    }
  }
}
</style>
