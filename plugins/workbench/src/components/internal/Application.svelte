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
<script type="ts">
  import type { ItemCreator, WorkbenchApplication } from '../..'
  import workbench from '../..'

  import type { QueryUpdater } from '@anticrm/platform-core'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import CreateForm from './CreateForm.svelte'
  import IconEditBox from '@anticrm/platform-ui/src/components/IconEditBox.svelte'
  import type { Space } from '@anticrm/domains'
  import type { Viewlet } from '@anticrm/presentation'
  import ui, { createLiveQuery, getCoreService, liveQuery } from '@anticrm/presentation'
  import type { Action } from '@anticrm/platform-ui'
  import { getUIService } from '@anticrm/platform-ui'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import ActionBar from '@anticrm/platform-ui/src/components/ActionBar.svelte'
  import type { Class, Doc, Model, Ref } from '@anticrm/core'
  import CreateControl from './CreateControl.svelte'

  export let application: WorkbenchApplication
  export let space: Space

  const coreService = getCoreService()
  const uiService = getUIService()

  let model: Model
  coreService.then((cs) => {
    model = cs.getModel()
  })

  // Represent all possible presenters
  let presenters: Viewlet[] = []
  let creators: ItemCreator[] = []

  let viewletActions: Action[] = []
  let activeViewlet: Viewlet | undefined
  let viewletProps: Record<string, any> = {}
  let activeClasses: Ref<Class<Doc>>[] = []

  let creatorsQuery: Promise<QueryUpdater<ItemCreator>>

  const onCreatorClick = (creator: ItemCreator) => uiService.showModal(CreateForm, { creator, spaces: [space] })

  $: creatorsQuery = liveQuery<ItemCreator>(
    creatorsQuery,
    workbench.class.ItemCreator,
    { app: application._id as Ref<WorkbenchApplication> },
    (docs) => {
      creators = docs
    }
  )

  createLiveQuery<Viewlet>(ui.mixin.Viewlet, {}, (docs) => {
    presenters = docs
  })

  function filterViewlets (model: Model, presenters: Viewlet[], application: WorkbenchApplication): Viewlet[] {
    return presenters.filter((d) => {
      for (const cc of application.classes) {
        if (model.is(cc, d.displayClass)) {
          return true
        }
      }
      return false
    })
  }

  function findViewletClasses (model: Model, application: WorkbenchApplication, vielet: Viewlet): Ref<Class<Doc>>[] {
    const result: Ref<Class<Doc>>[] = []
    for (const cc of application?.classes) {
      if (model.is(cc, vielet.displayClass)) {
        result.push(cc)
      }
    }
    return result
  }

  function getViewletActions (
    appInstance: WorkbenchApplication,
    sp: Viewlet | undefined,
    viewlets: Viewlet[]
  ): Action[] {
    return viewlets.map((p) => {
      return {
        id: p._id,
        name: p.label,
        icon: p.icon,
        toggleState: p._id === sp?._id,
        action: () => {
          activeViewlet = p
        }
      }
    })
  }

  // Update available presenters based on application
  $: if (model) {
    const viewlets = filterViewlets(model, presenters, application)
    if (viewlets.length > 0 && (!activeViewlet || viewlets.every((x) => x._id !== activeViewlet?._id))) {
      activeViewlet = viewlets[0]
    }
    viewletActions = getViewletActions(application, activeViewlet, viewlets)
  }

  $: if (activeViewlet && model) {
    activeClasses = findViewletClasses(model, application, activeViewlet)
    if (activeViewlet.parameters) {
      viewletProps = { ...activeViewlet.parameters, _class: activeClasses[0], space, editable: false }
    } else {
      viewletProps = { _class: activeClasses[0], space, editable: false }
    }
  }
</script>

<div class="workbench-browse">
  {#if application}
    <div class="captionContainer">
      <div class="captionLeftItems">
        <span class="caption-1" style="padding-right:1em">{application.label}</span>&nbsp;
        <CreateControl {creators} {onCreatorClick} />
      </div>
      <IconEditBox
        icon={workbench.icon.Finder}
        placeholder="Поиск по {application.label}..."
        iconRight={true}
        value="" />
    </div>
    <div class="presentation">
      <ActionBar actions={viewletActions} />
    </div>
    <ScrollView height="100%" margin="2em">
      {#if activeViewlet && activeViewlet.component && activeClasses.length > 0}
        <Component is={activeViewlet.component} props={viewletProps} on:open />
      {/if}
    </ScrollView>
  {/if}
</div>

<style lang="scss">
  .workbench-browse {
    height: 100%;
    display: flex;
    flex-direction: column;

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--theme-bg-accent-color);
    }

    .captionLeftItems {
      display: flex;
      align-items: center;
    }

    .presentation {
      display: flex;
      flex-direction: row-reverse;
      margin-right: 1em;
    }
  }
</style>
