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
  import workbench, { WorkbenchApplication } from '../..'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import CreateForm from './CreateForm.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import IconEditBox from '@anticrm/platform-ui/src/components/IconEditBox.svelte'
  import { Space } from '@anticrm/domains'
  import ui, { createLiveQuery, getCoreService, Viewlet } from '@anticrm/presentation'
  import { Action, getUIService } from '@anticrm/platform-ui'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import ActionBar from '@anticrm/platform-ui/src/components/ActionBar.svelte'
  import { Model } from '@anticrm/core'

  export let application: WorkbenchApplication
  export let space: Space

  const coreService = getCoreService()
  const uiService = getUIService()

  let addIcon: HTMLElement

  // Represent all possible presenters
  let presenters: Viewlet[] = []

  let viewletActions: Action[] = []
  let activeViewlet: Viewlet | undefined

  createLiveQuery(ui.mixin.Viewlet, {}, (docs) => {
    presenters = docs
  })

  function filterViewlets (model: Model, presenters: Viewlet[]): Viewlet[] {
    return presenters.filter((d) => {
      for (const cc of application?.classes) {
        if (model.is(cc, d.displayClass)) {
          return true
        }
      }
      return false
    })
  }

  function getViewletActions (appInstance: WorkbenchApplication, sp: Viewlet | undefined, viewlets: Viewlet[]): Action[] {
    return viewlets.map(p => {
      return {
        name: p.label, icon: p.icon, toggleState: p._id === sp?._id, action: () => {
          activeViewlet = p
        }
      }
    })
  }

  $: {
    // Update available presenters based on application
    coreService.then(cs => {
      const model = cs.getModel()

      const viewlets = filterViewlets(model, presenters)
      if (viewlets.length > 0 && !activeViewlet) {
        activeViewlet = viewlets[0]
      }
      viewletActions = getViewletActions(application, activeViewlet, viewlets)
    })
  }

  function getLabel (str: string): string {
    if (str === 'Pages') return 'New page'
    if (str === 'Tasks') return 'New task'
    if (str === 'Vacancies') return 'Add candidate'
    return 'Add'
  }
</script>

<div class="workbench-browse">
  { #if application }
    <div class="captionContainer">
      <span class="caption-1" style="padding-right:1em">{application.label}</span>&nbsp;
      <div bind:this={addIcon}>
        <Button kind="transparent"
                on:click={ () => {
            uiService.showModal(CreateForm, { _class: application ? application.classes[0] : undefined, space: space._id }, addIcon)
          } }
        >
          <Icon icon={workbench.icon.Add} button="true" />
          <span style="padding-left:.5em">{getLabel(application.label)}</span>
        </Button>
      </div>
      <div style="flex-grow:1"></div>
      <IconEditBox icon={workbench.icon.Finder} placeholder="Поиск по {application.label}..." iconRight="true" />
    </div>
    <div class="presentation">
      <ActionBar actions={viewletActions} />
    </div>
    <ScrollView height="100%" margin="2em">
      {#if activeViewlet && activeViewlet.component}
        <Component is={activeViewlet.component}
                   props={{_class: application.classes[0], space: space, editable: false}} on:open />
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
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .presentation {
      display: flex;
      flex-direction: row-reverse;
      margin-right: 1em;
    }

  }
</style>
