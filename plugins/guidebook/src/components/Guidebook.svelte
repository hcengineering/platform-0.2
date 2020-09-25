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
  import { Ref, Doc } from '@anticrm/core'
  import guidebook from '..'
  import { find, getUIService } from '../utils'
  import { getContext, onMount } from 'svelte'

  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'

  import { GuideBookPage, pages, pageIndex } from '../registry'

  //****************************************************************

  // let perspectives: Perspective[] = []
  let current: string
  let currentPage: GuideBookPage

  const location = getUIService().getLocation()

  location.subscribe((loc) => {
    current = loc.pathname.split('/')[2] as string
    let cp = pageIndex.get(current)
    console.log(cp)
    if (cp == undefined) {
      currentPage = pages[0]
    } else {
      currentPage = cp
    }
  })

  // $: component = perspectives.find((h) => h._id === current)?.component
</script>

<div id="guidebook">
  <nav>
    {#each pages as page (page.label)}
      <div
        class="app-icon"
        class:current-app="{page.id === current}"
        style="{'margin-left:' + page.level * 20 + 'px'}"
      >
        <div class="label">
          <LinkTo href="{'/' + guidebook.component.GuideBook + '/' + page.id}">
            {page.label}
          </LinkTo>
        </div>
        {#if page.id == current}
          <div class="icon-arrow">
            <svg viewBox="0 0 24 24" width="100%" height="100%">
              <line
                x1="-20"
                y1="12"
                x2="19"
                y2="12"
                stroke="white"
                fill="white"
              ></line>
              <polyline
                points="12 5 19 12 12 19"
                stroke="white"
                fill="white"
              ></polyline>
            </svg>
          </div>
        {/if}
      </div>
    {/each}
    <div class="remainder"></div>
  </nav>

  <div class="main">
    <h1>Component {currentPage.label}</h1>

    <div class="content">
      {#if currentPage != undefined}
        <svelte:component this="{currentPage.component}" on:change />
      {/if}
    </div>
  </div>

  <!-- <Spotlight /> -->
</div>

<style lang="scss">
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
    background-color: var(--theme-bg-color);
    border-right: solid 1px var(--theme-separator-color);

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
      &.current-app {
        background-color: var(--theme-bg-color);
      }
    }

    .remainder {
      flex-grow: 1;
    }
  }

  .main {
    flex-grow: 1;
    min-width: 300px;
    background-color: var(--theme-content-bg-color);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    .content {
      overflow: auto;
    }
  }
</style>
