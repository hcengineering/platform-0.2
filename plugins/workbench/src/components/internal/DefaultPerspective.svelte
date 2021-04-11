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
  import type { Class, Doc, Property, Ref, StringProperty } from '@anticrm/core'
  import { onDestroy } from 'svelte'
  import type { Space, Title } from '@anticrm/domains'
  import { TitleSource } from '@anticrm/domains'
  import { CORE_CLASS_SPACE, CORE_CLASS_TITLE } from '@anticrm/domains'
  import ui, { getUIService, newRouter } from '@anticrm/platform-ui'
  import type { WorkbenchApplication } from '../..'
  import workbench from '../..'
  import type { CoreDocument } from '@anticrm/presentation'
  import { createLiveQuery, getCoreService, getUserId } from '@anticrm/presentation'

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
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  let prevDiv: HTMLElement
  let nextDiv: HTMLElement

  const uiService = getUIService()
  const coreService = getCoreService()

  const currentUser: string = getUserId()

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
      app: applications.length > 0 ? applications[0].route : ('#undefined' as Ref<WorkbenchApplication>)
    } as WorkbenchRouteInfo
  }

  const router = newRouter<WorkbenchRouteInfo>(
    ':app?space',
    (info) => {
      if (spaces.length > 0) {
        space = spaces.find((s) => s._id === (info.space as Ref<Space>) || s.spaceKey === info.space)
      }
      if (applications.length > 0) {
        application =
          applications.find((a) => a._id === info.app || a.route === info.app || a.label === info.app) ||
          applications[0]
      }
    },
    routeDefaults()
  )

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

  function appSpaces (spaces: Space[], app: WorkbenchApplication): Space[] {
    return spaces.filter((sp) => sp.application === app._id)
  }
</script>

<div class="workbench-perspective">
  <nav>
    <div class="section">
      <div class="status-online" />
    </div>
    <div class="app-icon">
      {#each applications as app}
        <div class="iconApp" class:selectedApp={app._id === application._id}>
          <div class="cropIcon">
            <LinkTo on:click={() => router.navigate({ app: app.route })}>
              <Icon icon={app.icon} size="32" />
            </LinkTo>
          </div>
        </div>
      {/each}
    </div>
    <div class="section">
      <img class="ava" src="https://platform.exhale24.ru/images/photo-3.png" alt="" />
    </div>
  </nav>
  <div class="projects">
    <div class="projects-head">
      <img src="https://platform.exhale24.ru/images/logo_persp.png" alt="Voltron Team" />
      <span>Voltron Team</span>
      <div class="arrowDown" />
    </div>
    <div class="container">
      {#each applications as app}
        <div class="application-box">
          <div class="app-selector">
            <div class="nav-link" class:selected={app._id === application._id}>
              <LinkTo on:click={() => router.navigate({ app: app.route, space: undefined })}>
                <div class="labeled-icon">
                  <Icon icon={workbench.icon.ArrowDown} size="12" />
                  <span>{app.label}</span>
                </div>
              </LinkTo>
            </div>
            {#if app._id === application._id && app.supportSpaces}
              <PopupMenu>
                <div class="popup" slot="trigger">
                  <Icon icon={ui.icon.Add} button="true" />
                </div>
                <PopupItem
                  on:click={() => {
                    uiService.showModal(CreateSpace, { application: app })
                  }}
                  >Create
                </PopupItem>
                <PopupItem
                  on:click={() => {
                    uiService.showModal(BrowseSpace, { application: app })
                  }}
                  >Browse
                </PopupItem>
              </PopupMenu>
            {/if}
          </div>
          {#if appSpaces(spaces, app).length}
            <div class="content">
              {#each appSpaces(spaces, app) as s (s._id)}
                {#if !s.archived}
                  <LinkTo on:click={() => router.navigate({ app: app.route, space: s.spaceKey })}>
                    <SpaceItem selected={space && s._id === space._id} space={s} />
                  </LinkTo>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="separator" />
    <Button><span class="btn-bottom">Add Teammates</span></Button>
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
    <Splitter {prevDiv} {nextDiv} minWidth="414" />
    <aside bind:this={nextDiv}>
      <ObjectForm
        _class={details._class}
        _objectId={details._id}
        title="Title"
        on:close={() => navigateDocument(undefined)}
        on:noobject={() => (details = undefined)} />
    </aside>
  {/if}
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .workbench-perspective {
    display: flex;
    height: 100%;
  }

  nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
    height: 100%;
    width: 96px;
    min-width: 96px;
    max-width: 96px;

    .section {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
    }

    .app-icon {
      margin: auto auto;
      width: 52px;
    }

    .iconApp {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 52px;
      height: 52px;
      border-radius: 8px;
      cursor: pointer;
    }
    .iconApp + .iconApp {
      margin-top: 16px;
    }
    .cropIcon {
      width: 32px;
      height: 32px;
    }

    .ava {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
  }
  :global(.theme-dark) .iconApp {
    color: $theme-dark-content-trans-color;
  }
  :global(.theme-grey) .iconApp {
    color: $theme-grey-content-trans-color;
  }
  :global(.theme-light) .iconApp {
    color: $theme-light-content-trans-color;
  }
  :global(.theme-dark) .selectedApp {
    background-color: $theme-dark-bg-accent-color;
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .selectedApp {
    background-color: $theme-grey-bg-accent-color;
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .selectedApp {
    background-color: $theme-light-bg-accent-color;
    color: $theme-light-caption-color;
  }

  .status-online {
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }
  :global(.theme-dark) .status-online {
    background-color: $theme-dark-status-online;
  }
  :global(.theme-grey) .status-online {
    background-color: $theme-grey-status-online;
  }
  :global(.theme-light) .status-online {
    background-color: $theme-light-status-online;
  }

  .projects {
    display: flex;
    flex-direction: column;
    margin-right: 12px;
    padding: 20px;
    width: 263px;
    min-width: 263px;
    border-radius: 20px;
    position: relative;

    .projects-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      margin: 4px 15px 44px 8px;
      & span {
        padding-left: 11px;
        flex-grow: 1;
        font-weight: 500;
      }
    }

    .container {
      margin: 0 8px;
      height: 100%;
      overflow-y: auto;
    }
  }
  :global(.theme-dark) .projects-head {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .projects-head {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .projects-head {
    color: $theme-light-caption-color;
  }

  .mini {
    box-sizing: border-box;
    width: 60px;
    min-width: 60px;
    max-width: 60px;
  }

  .arrowDown {
    position: relative;
    width: 8px;
    height: 8px;
    border: solid 4px transparent;
  }
  :global(.theme-dark) .arrowDown {
    border-top: solid 4px $theme-dark-caption-color;
  }
  :global(.theme-grey) .arrowDown {
    border-top: solid 4px $theme-grey-caption-color;
  }
  :global(.theme-light) .arrowDown {
    border-top: solid 4px $theme-light-caption-color;
  }

  .main {
    width: 100%;
    height: 100%;
    border-radius: 20px;
  }

  aside {
    width: 414px;
    min-width: 414px;
    border-radius: 20px;
  }

  :global(.theme-dark) .projects,
  :global(.theme-dark) .main,
  :global(.theme-dark) aside {
    background-color: $theme-dark-bg-color;
    border: solid 1px $theme-dark-bg-accent-color;
  }
  :global(.theme-grey) .projects,
  :global(.theme-grey) .main,
  :global(.theme-grey) aside {
    background-color: $theme-grey-bg-color;
    border: solid 1px $theme-grey-bg-accent-color;
  }
  :global(.theme-light) .projects,
  :global(.theme-light) .main,
  :global(.theme-light) aside {
    background-color: $theme-light-bg-color;
    border: solid 1px $theme-light-bg-accent-color;
  }

  .app-selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;

    .nav-link {
      flex-grow: 1;
    }

    .labeled-icon {
      display: flex;
      align-items: center;
      font-weight: 500;

      span {
        margin-left: 14px;
      }
    }
  }
  :global(.theme-dark) .labeled-icon span {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .labeled-icon span {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .labeled-icon span {
    color: $theme-light-caption-color;
  }

  .application-box {
    margin-bottom: 20px;

    .content {
      margin: 14px 0 50px;
    }
  }

  .separator {
    height: 20px;
  }
  .btn-bottom {
    font-size: 16px;
    font-weight: 500;
  }
  :global(.theme-dark) .btn-bottom {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .btn-bottom {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .btn-bottom {
    color: $theme-light-caption-color;
  }
</style>
