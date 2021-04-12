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
  import guidebook from '..'
  import { onDestroy } from 'svelte'

  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'

  import type { GuideBookPage } from '../registry'
  import { pageIndex, pages } from '../registry'
  import { getUIService } from '@anticrm/platform-ui'

  //* ***************************************************************

  // let perspectives: Perspective[] = []
  let current: string
  let currentPage: GuideBookPage

  getUIService().subscribeLocation((loc) => {
    current = loc.path[2] as string
    const cp = pageIndex.get(current)
    console.log(cp)
    if (cp === undefined) {
      currentPage = pages[0]
    } else {
      currentPage = cp
    }
  }, onDestroy)

  // $: component = perspectives.find((h) => h._id === current)?.component
</script>

<div id="guidebook">
  <nav>
    {#each pages as page (page.label)}
      <div class="app-icon" class:current-app={page.id === current} style={`margin-left: ${page.level * 20}px`}>
        <div class="label">
          <LinkTo href={`/${guidebook.component.GuideBook}/${page.id}`}>{page.label}</LinkTo>
        </div>
        {#if page.id === current}
          <div class="icon-arrow">
            <svg viewBox="0 0 24 24" width="100%" height="100%">
              <line x1="-20" y1="12" x2="19" y2="12" stroke="white" fill="white" />
              <polyline points="12 5 19 12 12 19" stroke="white" fill="white" />
            </svg>
          </div>
        {/if}
      </div>
    {/each}
    <div class="remainder" />
  </nav>

  <div class="main">
    <h1>Component {currentPage.label}</h1>

    <div class="content">
      {#if currentPage !== undefined}
        <svelte:component this={currentPage.component} on:change />
      {/if}
    </div>
  </div>

  <!-- <Spotlight /> -->
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  #guidebook {
    display: flex;
    height: 100%;
    font: Overpass, sans-serif;
    font-size: 14px;
  }

  nav {
    flex-shrink: 0;
    margin: 15px;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    .app-icon {
      display: flex;
      align-items: stretch;
      min-height: 20px;
      .label {
        flex-grow: 1;
        align-self: center;
      }
      .icon-arrow {
        margin: 0 0 0 20px;
        width: 40px;
        height: 20px;
      }
    }
    .remainder {
      flex-grow: 1;
    }
  }
  :global(.theme-dark) nav {
    background-color: $theme-dark-bg-color;
    border-right: solid 1px $theme-dark-bg-accent-color;
    .app-icon {
      &.current-app {
        background-color: $theme-dark-bg-color;
      }
    }
  }
  :global(.theme-grey) nav {
    background-color: $theme-grey-bg-color;
    border-right: solid 1px $theme-grey-bg-accent-color;
    .app-icon {
      &.current-app {
        background-color: $theme-grey-bg-color;
      }
    }
  }
  :global(.theme-light) nav {
    background-color: $theme-light-bg-color;
    border-right: solid 1px $theme-light-bg-accent-color;
    .app-icon {
      &.current-app {
        background-color: $theme-light-bg-color;
      }
    }
  }

  .main {
    flex-grow: 1;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    .content {
      overflow: auto;
    }
  }
  :global(.theme-dark) .main {
    background-color: $theme-dark-bg-color;
  }
  :global(.theme-grey) .main {
    background-color: $theme-grey-bg-color;
  }
  :global(.theme-light) .main {
    background-color: $theme-light-bg-color;
  }
</style>
