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
  import type { Platform } from '@anticrm/plugin'
  import type { Asset } from '@anticrm/plugin-ui'
  import ui from '@anticrm/plugin-ui'
  import { getContext } from 'svelte'

  export let icon: Asset | undefined
  // --- prop 'size' in 'px': '12', '16', '24', '32', '42' --- //
  export let size = '16'
  export let button = false
  export let color = ''

  const platform = getContext('platform') as Platform
  let url: string
  $: url = platform.getMetadata(icon || ui.icon.Default) || 'https://anticrm.org/logo.svg'

  let fs: string, cl: string
  switch (size) {
    case '12':
      fs = 'icon-12'
      break
    case '24':
      fs = 'icon-24'
      break
    case '32':
      fs = 'icon-32'
      break
    case '42':
      fs = 'icon-42'
      break
    default:
      fs = 'icon-16'
  }
  if (button) cl = 'icon-button'
  else cl = 'icon'
</script>

<div style="width: {size}px; height: {size}px">
  <svg class="{cl} {fs}" style={color !== '' ? 'fill:' + color : ''}>
    <use href={url} />
  </svg>
</div>
