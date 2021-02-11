<script lang="ts">
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
  import { Doc, Ref } from '@anticrm/core'
  import workbench, { Perspective } from '../..'
  import { _getCoreService, getUIService } from '../../utils'
  import { onDestroy } from 'svelte'

  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import Spotlight from './Spotlight.svelte'
  import { AnyComponent } from '@anticrm/platform-ui'

  let perspectives: Perspective[] = []
  let activePerspective: Ref<Doc>
  let component: AnyComponent | undefined

  const coreService = _getCoreService()
  const uiService = getUIService()
  const location = uiService.getLocation()
  location.subscribe((loc) => {
    activePerspective = loc.pathname.split('/')[2] as Ref<Doc>
  })

  coreService.subscribe(workbench.class.Perspective, {}, (p) => {
    perspectives = p
  }, onDestroy)

  function findPerspective (perspectives: Perspective[]): Perspective | undefined {
    if (perspectives) {
      return perspectives.find((h) => h._id === activePerspective)
    }
    return undefined
  }

  function getCurrentComponent (perspectives: Perspective[]): AnyComponent | undefined {
    return findPerspective(perspectives)?.component
  }

  $: {
    if (perspectives) {
      if (!findPerspective(perspectives) && perspectives.length > 0) {
        activePerspective = perspectives[0]._id
      }

      component = getCurrentComponent(perspectives)
    }
  }

  function handleKeydown (ev: KeyboardEvent) {
    if (ev.code === 'KeyS' && ev.ctrlKey) {
      uiService.showModal(Spotlight, {})
    }
  }
</script>

<div id="workbench">
  <main>
    {#if component}
      <Component is="{component}" props={activePerspective} />
    {/if}
  </main>

</div>

<svelte:window on:keydown={handleKeydown} />

<style lang="scss">
  #workbench {
    display: flex;
    height: 100%;
  }

  main {
    background-color: var(--theme-bg-color);
    width: 100%;
  }
</style>
