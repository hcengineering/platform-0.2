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
  import { Ref, Doc } from '@anticrm/core'
  import workbench, { Perspective } from '../..'
  import { find, getUIService } from '../../utils'
  import { getContext } from 'svelte'

  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'

  let perspectives: Perspective[] = []
  let current: Ref<Doc>

  const location = getUIService().getLocation()
  location.subscribe(loc => {
    current = loc.pathname.split('/')[2] as Ref<Doc>
  })

  find(workbench.class.Perspective, {}).then(p => { 
    perspectives = p 
  })

  $: component = perspectives.find(h => h._id === current)?.component
</script>

<div id="workbench">
 
  <nav>
    { #each perspectives as perspective (perspective._id) }
    <div
      class="app-icon"
      class:current-app={ perspective._id === current }
    >
      <LinkTo href={'/' + workbench.component.Workbench + '/' + perspective._id}>
        <div class="icon"><Icon icon={ perspective.icon } clazz="icon-2x"/></div>
      </LinkTo>
    </div>
    { /each }
    <div class="remainder"></div>
  </nav>

  <main>
    { #if component}
      <Component is={ component }/>
    { /if}
  </main>

  <!-- <Spotlight /> -->
</div>

<style lang="scss">
  #workbench {
    display: flex;
    height: 100%;
  }
  
  nav {
    width: 48px;
    background-color: var(--theme-bg-color);

    display: flex;
    flex-direction: column;

    .app-icon {
      border-bottom: solid 1px var(--theme-separator-color);
      border-right: solid 1px var(--theme-separator-color);

      .icon {
        padding: 1em;
      }

      &.current-app {
        background-color: var(--theme-bg-color);
        border-right: solid 1px var(--theme-content-bg-color);
      }
    }

    .remainder {
      flex-grow: 1;
      border-right: solid 1px var(--theme-separator-color);
    }      
  }

  main {
    background-color: var(--theme-content-bg-color);
    width: 100%;
  }

</style>
