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
<script lang='ts'>
  import { Ref, Doc, Class } from '@anticrm/core'
  import { onDestroy } from 'svelte'
  import { find, getCoreService, getUIService, _getCoreService } from '../../utils'
  import { Space, VDoc, CORE_CLASS_SPACE } from '@anticrm/domains'
  import ui from '@anticrm/platform-ui'
  import workbench, { WorkbenchApplication } from '../..'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import SpaceItem from './spaces/SpaceItem.svelte'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'
  import BrowseSpace from './spaces/BrowseSpace.svelte'
  import CreateSpace from './spaces/CreateSpace.svelte'

  import { AnyComponent } from '@anticrm/platform-ui'

  import JoinSpace from './spaces/JoinSpace.svelte'
  import MainComponent from '../proxies/MainComponent.svelte'

  import ObjectForm from './ObjectForm.svelte'
  import { getSpaceName, getCurrentUserSpace } from './spaces/utils'

  const uiService = getUIService()

  let location: string[]
  const locationStore = uiService.getLocation()
  locationStore.subscribe((loc) => {
    console.log('LOCATION is ', loc)
    location = loc.pathname.split('/')
  })

  const curentUser = _getCoreService().getUserId()

  let space: Ref<Space>
  let spaces: Space[] = []
  let spaceUnsubscribe: () => void | undefined

  getCoreService()
    .then((coreService) => coreService.query(CORE_CLASS_SPACE, {}))
    .then((qr) => {
      spaceUnsubscribe = qr.subscribe((docs) => {
        console.log('spaces:', docs)
        spaces = docs.filter((s) => getCurrentUserSpace(curentUser, s))
      })
    })

  onDestroy(() => {
    if (spaceUnsubscribe) spaceUnsubscribe()
  })

  let application: Ref<WorkbenchApplication>
  let applications: Array<WorkbenchApplication> = []
  find(workbench.class.WorkbenchApplication, {}).then((docs) => {
    applications = docs
  })

  let component: AnyComponent | undefined

  $: {
    space = location[3] as Ref<Space>
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

  let details: { _id: Ref<VDoc>; _class: Ref<Class<VDoc>> }
  let addButton: HTMLElement

  let hidden = true
  //let showPopup: string = 'hidden';
</script>

<style lang='scss'>
  .workbench-perspective {
    display: flex;
    height: 100%;
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
    // background-color: blue;
    // display: flex;
    // flex-direction: column;

    // .main-content {
    //   height: 100%;
    // flex-grow: 2;
    // align-items: stretch;
    //   background-color: blue;
    // }

    // .input-control {
    //   padding: 1em;
    //   max-height: 400px;
    // }
  }

  aside {
    //max-width: 404px;
    background-color: var(--theme-bg-color);
    border-left: 1px solid var(--theme-bg-accent-color);
  }
</style>

<div class='workbench-perspective'>
  <div class='projects' class:mini={!hidden}>
    <a href='/' style='position:absolute;top:1.5em;right:1.5em;' on:click|preventDefault={() => { hidden = !hidden}}>
      <Icon icon={workbench.icon.Resize} className='icon-button' />
    </a>
    <div class='container' class:hidden={!hidden}>
      <div class='caption-3'>
        Пространства
      </div>
      <SpaceItem link={'/' + location[1] + '/' + location[2]} selected={!space} space={{ name: 'Все', isPublic: true }}
                 count={Math.floor(Math.random()*50)} />
      {#each spaces as s (s._id)}
        {#if !s.archived}
          <SpaceItem link={'/' + location[1] + '/' + location[2] + '/' + s._id}
                     selected={s._id === space} space={s} />
        {/if}
      {/each}
      <div class='footContainer'>
        <span>
          <PopupMenu>
            <div class='popup' slot='trigger'><Icon icon={ui.icon.Add} className='icon-button' /></div>
            <PopupItem on:click={() => {
              uiService.showModal(CreateSpace, {})
            }}>Create</PopupItem>
            <PopupItem on:click={() => {
              uiService.showModal(BrowseSpace, {})
            }}>Browse</PopupItem>
          </PopupMenu>
        </span>
      </div>

      <div class='caption-3'>Приложения</div>
      {#each applications as app (app._id)}
        <div class='item' class:selected={app._id === application}
             on:click|preventDefault={(e) => {
            application = id(app)
          }}>{app.label}
        </div>
      {/each}
    </div>
  </div>

  <div class='main'>
    <!-- <div class="main-content"> -->
    {#if component}
      <MainComponent
        is={component}
        {application}
        {space}
        on:open={(e) => {
          details = e.detail
        }} />
    {/if}
    <!-- </div>
    <div class="input-control">
      <InputControl />
    </div> -->
  </div>

  <aside>
    <!-- <DetailsForm v-if="details" :_class="details._class" :_id="details._id" @done="done" /> -->
    {#if details}
      <ObjectForm {...details} title='Title' />
    {/if}
  </aside>
</div>
