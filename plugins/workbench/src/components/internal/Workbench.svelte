<script lang="ts">
  import type { Perspective, WorkbenchApplication } from '../..'
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
  import workbench from '../..'
  import { createLiveQuery } from '@anticrm/presentation'

  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import Spotlight from './Spotlight.svelte'
  import type { AnyComponent } from '@anticrm/platform-ui'
  import { getUIService, newRouter } from '@anticrm/platform-ui'
  import type { Ref } from '@anticrm/core'

  const uiService = getUIService()

  let perspectives: Perspective[] = []
  let component: AnyComponent | undefined

  let activePerspective: string

  export interface PerspectiveReference {
    perspective: string
  }

  export interface WorkbenchRouterReference {
    space: string // A ref of space name
    app: Ref<WorkbenchApplication>
  }

  const router = newRouter<PerspectiveReference>(
    ':perspective',
    (info) => {
      activePerspective = info.perspective

      if (perspectives.length > 0 && activePerspective) {
        const pp = perspectives.find((h) => h.name === activePerspective) || perspectives[0]
        component = pp?.component
      }
    },
    { perspective: '#none' }
  )

  createLiveQuery(workbench.class.Perspective, {}, (p) => {
    perspectives = p
    if (perspectives.length > 0) {
      router.setDefaults({ perspective: perspectives[0].name })
    }
  })

  function handleKeydown (ev: KeyboardEvent) {
    if (ev.code === 'KeyS' && ev.ctrlKey) {
      uiService.showModal(Spotlight, {})
    }
  }
</script>

<div id="workbench">
  <main>
    {#if component}
      <Component is={component} props={activePerspective} />
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
    width: 100%;
    padding: 20px 20px 20px 0;
  }
</style>
