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
  import { AnyComponent, newRouter } from '@anticrm/platform-ui'

  const coreService = _getCoreService()
  const uiService = getUIService()

  interface PerspectiveInfo {
    perspective: string
  }

  let perspectives: Perspective[] = []
  let component: AnyComponent | undefined

  let activePerspective: string

  const router = newRouter<PerspectiveInfo>(':perspective', (info) => {
    activePerspective = info.perspective

    if (perspectives.length > 0 && activePerspective) {
      var pp = perspectives.find((h) => h.name === activePerspective) || perspectives[0]
      component = pp?.component
      console.log('COMPONENT:', pp, component, perspectives, activePerspective)
    }
  }, { perspective: '#none' })

  coreService.subscribe(workbench.class.Perspective, {}, (p) => {
    perspectives = p
    if (perspectives.length > 0) {
      router.setDefaults({ perspective: perspectives[0].name })
    }
  }, onDestroy)

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
