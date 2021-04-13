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
  import { setContext, onMount } from 'svelte'

  const current = 'theme-dark'

  const setRootColors = (theme: string) => {
    document.body.setAttribute('class', theme)
  }

  // setContext('theme', {
  //   setTheme: (name: string) => {
  //     setRootColors(name)
  //   }
  // })

  onMount(() => {
    // setRootColors(current)
  })

  import platform from '../platform'

  import ui from '@anticrm/plugin-ui'

  let component: any 

  async function boot (): Promise<void> {
    const uiService = await platform.getPlugin(ui.id)
    component = uiService.createApp(document.body)
  }

  boot().catch(err => {
  // new App({ target: document.body, props: { error: 'err.message' } }) // eslint-disable-line no-new
  })

</script>

<h1>App</h1>

<svelte:component this={component} />