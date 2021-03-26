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
  import { Class, Doc, Property, Ref, StringProperty } from '@anticrm/core'
  import { onDestroy } from 'svelte'
  import { CORE_CLASS_SPACE, CORE_CLASS_TITLE, Space, Title, TitleSource } from '@anticrm/domains'
  import ui, { getUIService, newRouter } from '@anticrm/platform-ui'
  import workbench, { WorkbenchApplication } from '../..'
  import { CoreDocument, createLiveQuery, getCoreService, getUserId } from '@anticrm/presentation'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import SpaceItem from './spaces/SpaceItem.svelte'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'
  import BrowseSpace from './spaces/BrowseSpace.svelte'
  import CreateSpace from './spaces/CreateSpace.svelte'

  import MainComponent from '../proxies/MainComponent.svelte'

  import ObjectForm from './ObjectForm.svelte'
  import { getCurrentUserSpace } from './spaces/utils'
  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'
  import Splitter from '@anticrm/sparkling-controls/src/internal/Splitter.svelte'

  let prevDiv: HTMLElement
  let nextDiv: HTMLElement

  const uiService = getUIService()
  const coreService = getCoreService()

  let currentUser: string = getUserId()

  let space: Space | undefined
  let spaces: Space[] = []

  let application: WorkbenchApplication
  let applications: WorkbenchApplication[] = []

  let details: CoreDocument | undefined

  interface WorkbenchRouteInfo {
    space: string // A ref of space name
    app: Ref<WorkbenchApplication>
  }

  function routeDefaults (): WorkbenchRouteInfo {
    return {
      space: spaces.length > 0 ? spaces[0].name : '#undefined',
      app: applications.length > 0 ? applications[0].route : '#undefined' as Ref<WorkbenchApplication>
    } as WorkbenchRouteInfo
  }

  const router = newRouter<WorkbenchRouteInfo>(':app?space', (info) => {
    if (spaces.length > 0) {
      space = spaces.find((s) => (s._id === info.space as Ref<Space>) || s.spaceKey === info.space)
    }
    if (applications.length > 0) {
      application = applications.find((a) => (a._id === info.app || a.route === info.app || a.label === info.app)) || applications[0]
    }
  }, routeDefaults())

  interface DocumentMatcher {
    doc: string | undefined
  }

  const documentRouter = newRouter<DocumentMatcher>('?doc', async (match) => {
    // Parse browse and convert it to _class and objectId
    if (match.doc) {
      // Check find a title
      const title = await (await coreService).findOne<Title>(CORE_CLASS_TITLE, {
        title: match.doc as StringProperty,
        source: TitleSource.ShortId as Property<TitleSource, number>
      })
      if (title) {
        // So we had a title,
        details = { _class: title._objectClass, _id: title._objectId }
      } else {
        // try extract class name from doc and find objectId.
        const pos = match.doc.lastIndexOf(':')
        if (pos !== -1) {
          const _class = match.doc.substring(0, pos)
          const _objectId = match.doc.substring(pos + 1)

          // Try find a class to be sure it is available.
          try {
            (await coreService).getModel().getClass(_class as Ref<Class<Doc>>)
          } catch (ex) {
            console.error(ex)
            details = undefined
            return
          }
          // We failed to find a title, use as is
          details = { _class: _class as Ref<Class<Doc>>, _id: _objectId as Ref<Doc> }
        } else {
          details = undefined
        }
      }
    } else {
      details = undefined
    }
  })

  async function navigateDocument (doc?: CoreDocument): Promise<void> {
    if (!doc) {
      documentRouter.navigate({ doc: undefined })
      return
    }
    // Find if object has a shortId.
    const title = await (await coreService).findOne<Title>(CORE_CLASS_TITLE, {
      _objectId: doc._id,
      _objectClass: doc._class,
      source: TitleSource.ShortId as Property<TitleSource, number>
    })

    if (title && title.title) {
      // Navigate using shortId
      documentRouter.navigate({ doc: `${title.title}` })
    } else {
      // There is not short Id, we should navigate using a full _class and objectId.
      documentRouter.navigate({ doc: `${doc._class}:${doc._id}` })
    }
  }

  uiService.registerDocumentProvider({
    open: navigateDocument,
    selection (): CoreDocument | undefined {
      return details
    }
  })

  onDestroy(() => {
    uiService.registerDocumentProvider(undefined)
  })

  createLiveQuery(CORE_CLASS_SPACE, {}, (docs) => {
    spaces = docs.filter((s) => getCurrentUserSpace(currentUser, s))
    router.setDefaults(routeDefaults())
  })

  createLiveQuery(workbench.class.WorkbenchApplication, {}, (docs) => {
    applications = docs
    router.setDefaults(routeDefaults())
  })

  function id<T extends Doc> (doc: T): Ref<T> {
    return doc._id as Ref<T>
  }

  let hidden = true

  function appSpaces (spaces: Space[], app: WorkbenchApplication): Space[] {
    return spaces.filter((sp) => sp.application === app._id)
  }
</script>

<style lang="scss">
  .workbench-perspective {
    display: flex;
    height: 100%;
  }

  nav {
    width: 52px;
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
    width: 60px;
    min-width: 60px;
    max-width: 60px;
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

  .app-selector {
    display: flex;
    flex-direction: row;
    width: 100%;

    .nav-link {
      flex-grow: 1;
    }

    .selected {
      color: var(--theme-userlink-color);
    }

    .labeled-icon {
      display: flex;

      span {
        margin-left: 0.5em;
      }
    }

    margin-bottom: 0.5em;
  }

  .application-box {
    margin: 1em;

    .content {
      margin-left: 1em;
    }
  }
</style>

<div class="workbench-perspective">
  <nav>
    <div class="app-icon">
      {#each applications as app}
        <LinkTo on:click={() => router.navigate({app: app.route})}>
          <div class="iconApp">
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
        Applications
      </div>
      {#each applications as app}
        <div class="application-box">
          <div class="app-selector">
            <div class="nav-link" class:selected={( app._id === application._id)}>
              <LinkTo on:click={() => router.navigate({app: app.route, space: undefined})}>
                <div class="labeled-icon">
                  <Icon icon={app.icon} size="16" />
                  <span> {app.label}</span>
                </div>
              </LinkTo>
            </div>
            {#if app._id === application._id && app.supportSpaces}
              <PopupMenu>
                <div class="popup" slot="trigger">
                  <Icon icon={ui.icon.Add} button="true" />
                </div>
                <PopupItem on:click={() => {
              uiService.showModal(CreateSpace, {application: app})
            }}>Create
                </PopupItem>
                <PopupItem on:click={() => {
              uiService.showModal(BrowseSpace, {application: app})
            }}>Browse
                </PopupItem>
              </PopupMenu>
            {/if}
          </div>
          <div class="content">
            {#each appSpaces(spaces, app) as s (s._id)}
              {#if !s.archived}
                <LinkTo on:click={() => router.navigate({ app: app.route, space: s.spaceKey })}>
                  <SpaceItem selected={space && s._id === space._id} space={s} />
                </LinkTo>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div bind:this={prevDiv} class="main">
    {#if space && application && application.component}
      <MainComponent
        is={application.component}
        {application}
        {space}
        on:open={(e) => navigateDocument({ _class: e.detail._class, _id: e.detail._id })} />
    {:else if application && application.rootComponent}
      <MainComponent
        is={application.rootComponent}
        {application}
        on:open={(e) => navigateDocument({ _class: e.detail._class, _id: e.detail._id })} />
    {:else}
      <MainComponent
        is={workbench.component.ApplicationDashboard}
        {application}
        on:open={(e) => navigateDocument({ _class: e.detail._class, _id: e.detail._id })} />
    {/if}
  </div>
  {#if details}
    <Splitter {prevDiv} {nextDiv} minWidth="404" />
    <aside bind:this={nextDiv}>
      <ObjectForm _class={details._class} _objectId={details._id} title="Title"
                  on:close={()=> navigateDocument(undefined)} on:noobject={()=> details = undefined} />
    </aside>
  {/if}
</div>
