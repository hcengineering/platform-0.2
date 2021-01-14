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
  import { Ref, Doc, Class } from '@anticrm/model'
  import { onDestroy } from 'svelte'
  import { find, getCoreService, getUIService } from '../../utils'
  import core, { Space, VDoc } from '@anticrm/core'
  import ui from '@anticrm/platform-ui'
  import workbench, { WorkbenchApplication } from '../..'

  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import { AnyComponent } from '@anticrm/platform-ui'

  import CreateSpace from './CreateSpace.svelte'
  import MainComponent from '../proxies/MainComponent.svelte'

  import ObjectForm from './ObjectForm.svelte'

  const uiService = getUIService()

  let location: string[]
  const locationStore = uiService.getLocation()
  locationStore.subscribe((loc) => {
    console.log('LOCATION is ', loc)
    location = loc.pathname.split('/')
  })

  let space: Ref<Space>
  let spaces: Space[] = []
  let spaceUnsubscribe: () => void | undefined

  getCoreService()
    .then((coreService) => coreService.query(core.class.Space, {}))
    .then((qr) => {
      spaceUnsubscribe = qr.subscribe((docs) => {
        console.log('spaces:', docs)
        spaces = docs
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

  function id<T extends Doc>(doc: T): Ref<T> {
    return doc._id as Ref<T>
  }

  let details: { _id: Ref<VDoc>; _class: Ref<Class<VDoc>> }
  let addButton: HTMLElement

  let hidden = true;
</script>

<style lang="scss">
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
    .headIcon {
      position: absolute;
      top: 1.5em;
      right: 1.5em;
    }
    .footContainer {
      text-align: center;
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
        color: var(--theme-blue-color);
        /*background-color: var(--theme-bg-accent-color);*/
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
    background-color: var(--theme-bg-color);
    border-left: 1px solid var(--theme-bg-accent-color);
  }
</style>

<div class="workbench-perspective">
  <div class="projects" class:mini={!hidden}>
    <div class="headIcon">
      <a href="/" on:click|preventDefault={() => { hidden = !hidden}}>
        <Icon icon={ui.icon.Resize} clazz="icon-embed" /></a>
    </div>
    <div class="container" class:hidden={!hidden}>
      <div class="caption-3">
        Пространства
      </div>
      <LinkTo href={'/' + location[1] + '/' + location[2]}>
        <div class="item" class:selected={!space}>
          Все
        </div>
      </LinkTo>
      {#each spaces as s (s._id)}
        <LinkTo href={'/' + location[1] + '/' + location[2] + '/' + s._id}>
          <div class="item" class:selected={s._id === space}>
            # {s.name}
          </div>
        </LinkTo>
      {/each}
      <div class="footContainer">
        <a
          bind:this={addButton}
          href="/"
          on:click|preventDefault={() => {
            uiService.showModal(CreateSpace, {}, addButton)
          }}>
          <Icon icon={ui.icon.Add} clazz="icon-embed" />
        </a>
      </div>

      <div class="caption-3">Приложения</div>
      {#each applications as app (app._id)}
        <div class="item" class:selected={app._id === application}
          on:click|preventDefault={(e) => {
            application = id(app)
          }}>{app.label}
        </div>
      {/each}
    </div>
  </div>

  <div class="main">
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
      <ObjectForm {...details} title="Title" />
    {/if}
  </aside>
</div>
