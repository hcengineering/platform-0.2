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
  import vue, { Asset, getPlatform } from '..'

  export default defineComponent({
    props: {
      icon: {
        type: [String, Promise]
      }
    },
    setup(props) {
      function getUrl(icon?: Asset) {
        return getPlatform().getMetadata(icon ?? vue.icon.Default) ?? 'https://pltfo.com/logo.svg'
      }

      const icon = props.icon
      let url: any
      if (icon instanceof Promise) {
        url = ref(getUrl())
        icon.then(u => {
          if (u) {
            url.value = u
          }
        })
      } else {
        url = getUrl(icon as unknown as Asset)
      }

      return {url}
    }
  })
</script>

<template>
  <svg class="ui-icon">
    <use :xlink:href="url"/>
  </svg>
</template>
