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
  import { Ref, Doc, Class } from '@anticrm/core'
  import { onDestroy } from 'svelte'
  import { getUIService, _getCoreService } from '../../utils'
  import { Space, VDoc, CORE_CLASS_SPACE } from '@anticrm/domains'
  import ui, { Location } from '@anticrm/platform-ui'
  import workbench, { WorkbenchApplication } from '../..'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import SpaceItem from './spaces/SpaceItem.svelte'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'
  import BrowseSpace from './spaces/BrowseSpace.svelte'
  import CreateSpace from './spaces/CreateSpace.svelte'

  import { AnyComponent } from '@anticrm/platform-ui'

  import MainComponent from '../proxies/MainComponent.svelte'

  import ObjectForm from './ObjectForm.svelte'
  import { getCurrentUserSpace } from './spaces/utils'
  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'
  import Splitter from '@anticrm/sparkling-controls/src/Splitter.svelte'

  let prevDiv: HTMLElement
  let nextDiv: HTMLElement

  const uiService = getUIService()

  const coreService = _getCoreService()

  const currentUser = coreService.getUserId()

  let space: Ref<Space>
  let spaces: Space[] = []

  coreService.subscribe(CORE_CLASS_SPACE, {}, (docs) => {
    spaces = docs.filter((s) => getCurrentUserSpace(currentUser, s))
  }, onDestroy)

  let application: Ref<WorkbenchApplication>
  let applications: Array<WorkbenchApplication> = []
  coreService.subscribe(workbench.class.WorkbenchApplication, {}, (docs) => {
    applications = docs
  }, onDestroy)

  let component: AnyComponent | undefined
  let details: { _id: Ref<Doc>; _class: Ref<Class<Doc>> }

  let location: Location
  uiService.subscribeLocation((loc) => {
    location = loc

    space = loc.query.space as Ref<Space>
    // Check if space are in list of spaces, and if not use first available space
    if (spaces.length > 0) {
      if (!spaces.find(s => s._id === space)) {
        space = spaces[0]._id as Ref<Space>
      }
    }
    application = loc.query.application as Ref<WorkbenchApplication>

    if (loc.query._class && loc.query._id) {
      details = { _id: loc.query._id as Ref<Doc>, _class: loc.query._class as Ref<Class<Doc>> }
    }
  }, onDestroy)

  $: {
    if (!application) {
      application = workbench.application.Activity
    }
    let apps = applications.filter((a) => a._id === application)
    if (apps.length == 1) {
      component = apps[0].component
    }
  }

  function id<T extends Doc> (doc: T): Ref<T> {
    return doc._id as Ref<T>
  }

  let addButton: HTMLElement

  let hidden = true
</script>

<style lang="scss">
  .workbench-perspective {
    display: flex;
    height: 100%;
  }

  nav {
    width: 60px;
    background-color: var(--theme-bg-color);

    display: flex;
    flex-direction: column;

    .app-icon {
      border-bottom: solid 1px var(--theme-bg-accent-color);
      border-right: solid 1px var(--theme-bg-accent-color);

      &.current-app {
        background-color: var(--theme-bg-color);
        border-right: solid 1px var(--theme-bg-color);
      }
    }

    .iconApp {
      padding: 1em;
      color: var(--theme-content-dark-color);
      cursor: pointer;
    }

    .selectedApp {
      padding: 1em;
      color: var(--theme-userlink-color);
    }

    .remainder {
      flex-grow: 1;
      border-right: solid 1px var(--theme-bg-accent-color);
    }
  }

  .projects {
    padding: 1em;
    width: 18em;
    min-width: 18em;
    position: relative;

    border-right: 1px solid var(--theme-bg-accent-color);

    .container {
      height: 100%;
      padding-right: 1px;
      overflow-y: auto;
    }

    .hidden {
      visibility: hidden;
    }

    .footContainer {
      display: flex;
      justify-content: center;
    }

    .item {
      box-sizing: border-box;
      font-family: var(--theme-font-content);
      font-weight: 500;
      padding: 0.5em;
      padding-top: calc(0.5em + 1px);
      margin-bottom: 0.25em;
      height: 2.5em;
      color: var(--theme-content-color);
      background-color: var(--theme-bg-color);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &.selected {
        font-weight: 700;
        color: var(--theme-content-dark-color);
        background-color: var(--theme-bg-accent-color);

        &:hover {
          cursor: default;
          color: var(--theme-content-dark-color);
          background-color: var(--theme-bg-accent-color);
        }
      }

      &:hover {
        color: var(--theme-doclink-color);
      }
    }
  }

  .mini {
    box-sizing: border-box;
    width: 4em;
    min-width: 4em;
  }

  .main {
    width: 100%;
    height: 100%;
  }

  aside {
    width: 404px;
    min-width: 404px;
    background-color: var(--theme-bg-color);
    border-left: 1px solid var(--theme-bg-accent-color);
  }
</style>

<div class="workbench-perspective">
  <nav>
    <div class="app-icon">
      {#each applications as app}
        <LinkTo query={{application: app._id}}>
          <div class={( app._id === application) ? 'selectedApp' : 'iconApp'}>
            <Icon icon={app.icon} size="24" />
          </div>
        </LinkTo>
      {/each}
    </div>
    <div class="remainder"></div>
  </nav>
  <div class="projects" class:mini={!hidden}>
    <a href="/" style="position:absolute;top:1.5em;right:1.5em;" on:click|preventDefault={() => { hidden = !hidden}}>
      <Icon icon={workbench.icon.Resize} button="true" />
    </a>
    <div class="container" class:hidden={!hidden}>
      <div class="caption-3">
        Пространства
      </div>
      {#each spaces as s (s._id)}
        {#if !s.archived}
          <LinkTo query={{space: s._id}}>
            <SpaceItem selected={s._id === space} space={s} />
          </LinkTo>
        {/if}
      {/each}
      <div class="footContainer">
        <span>
          <PopupMenu>
            <div class="popup" slot="trigger"><Icon icon={ui.icon.Add} button="true" /></div>
            <PopupItem on:click={() => {
              uiService.showModal(CreateSpace, {})
            }}>Create</PopupItem>
            <PopupItem on:click={() => {
              uiService.showModal(BrowseSpace, {})
            }}>Browse</PopupItem>
          </PopupMenu>
        </span>
      </div>
    </div>
  </div>

  <div bind:this={prevDiv} class="main">
    {#if component}
      <MainComponent
        is={component}
        {application}
        {space}
        on:open={(e) => {
          uiService.navigate(undefined, {_class: e.detail._class, _id: e.detail._id})
        }} />
    {/if}
  </div>
  {#if details}
    <Splitter {prevDiv} {nextDiv} minWidth="404" />
    <aside bind:this={nextDiv}>
      <ObjectForm {...details} title="Title" on:close={()=> {details = undefined}} />
    </aside>
  {/if}
</div>
