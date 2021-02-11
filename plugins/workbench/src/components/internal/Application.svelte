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
  import { Class, Ref } from '@anticrm/core'
  import { getUIService, _getCoreService } from '../../utils'
  import workbench, { WorkbenchApplication } from '../..'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Table from '@anticrm/presentation/src/components/internal/Table.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import CreateForm from './CreateForm.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import EditBox from '@anticrm/platform-ui/src/components/EditBox.svelte'
  import { Space } from '@anticrm/domains'
  import { onDestroy } from 'svelte'
  import ui, { ClassPresenter } from '@anticrm/presentation'
  import PresenterItem from './PresenterItem.svelte'
  import Component from '../../../../platform-ui/src/components/Component.svelte'

  export let application: Ref<WorkbenchApplication>
  export let space: Ref<Space>

  const coreService = _getCoreService()
  const uiService = getUIService()

  let addIcon: HTMLElement
  let appInstance: WorkbenchApplication | undefined

  // Represent all possible presenters
  let presenters: ClassPresenter[] = []
  let availablePresenters: ClassPresenter[] = []
  let selectedPresenter: ClassPresenter | undefined

  coreService.subscribe(ui.class.ClassPresenter, {}, (docs) => {
    presenters = docs
  }, onDestroy)

  const appSearch = coreService.subscribe(workbench.class.WorkbenchApplication, { _id: application }, apps => {
    appInstance = apps[0]
  }, onDestroy)

  const model = coreService.getModel()

  function filterAvailablePresenters (appInstance: WorkbenchApplication): ClassPresenter[] {
    return presenters.filter((d) => {
      for (const cc of appInstance?.classes) {
        if (model.is(cc, d.displayClass)) {
          return true
        }
      }
      return false
    })
  }

  $: {
    appSearch(workbench.class.WorkbenchApplication, { _id: application })

    if (appInstance) {
      // Update available presenters based on application
      availablePresenters = filterAvailablePresenters(appInstance)
      if (availablePresenters.length > 0 && !selectedPresenter) {
        selectedPresenter = availablePresenters[0]
      }
    }
  }

  function getLabel (str: string): string {
    if (str === 'Страницы') return 'Новая страница'
    if (str === 'Задачи') return 'Новая задача'
    return 'Добавить'
  }
</script>

<div class="workbench-browse">
  { #if appInstance }
    <div class="captionContainer">
      <span class="caption-1" style="padding-right:1em">{appInstance.label}</span>&nbsp;
      <div bind:this={addIcon}>
        <Button kind="transparent"
                on:click={ () => {
            uiService.showModal(CreateForm, { _class: appInstance ? appInstance.classes[0] : undefined, space }, addIcon)
          } }
        >
          <Icon icon={workbench.icon.Add} button="true" />
          <span style="padding-left:.5em">{getLabel(appInstance.label)}</span>
        </Button>
      </div>
      <div style="flex-grow:1"></div>
      <EditBox icon={workbench.icon.Finder} placeholder="Поиск по {appInstance.label}..." iconRight="true" />
    </div>
    <div class="presentation">
      {#each availablePresenters as p}
        <PresenterItem presenter={p} selected={p == selectedPresenter} on:select={() => selectedPresenter = p} />
      {/each}
    </div>
    <ScrollView height="100%" margin="2em">
      {#if selectedPresenter && selectedPresenter.component}
        <Component is={selectedPresenter.component} props={{_class: appInstance.classes[0], space: space}} on:open />
        <!--      <Table _class={appInstance.classes[0]} {space} on:open />-->
      {/if}
    </ScrollView>
  { /if                              }
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

    .table {
      margin: 1em;
      flex-grow: 1;
    }

    .details {
      border-top: 1px solid var(--theme-bg-accent-color);
      padding: 1em;
      //max-height: 400px;
    }

    .presentation {
      display: flex;
      flex-direction: row-reverse;
    }

  }
</style>
