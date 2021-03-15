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
  import { _getCoreService, getUIService } from '../../utils'
  import workbench, { WorkbenchApplication } from '../..'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import CreateForm from './CreateForm.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import EditBox from '@anticrm/platform-ui/src/components/EditBox.svelte'
  import { Space } from '@anticrm/domains'
  import { onDestroy } from 'svelte'
  import ui, { Viewlet } from '@anticrm/presentation'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import ActionBar from '@anticrm/platform-ui/src/components/ActionBar.svelte'
  import { Action, Location } from '@anticrm/platform-ui'

  export let application: WorkbenchApplication

  const coreService = _getCoreService()
  const uiService = getUIService()

  let addIcon: HTMLElement

  const model = coreService.getModel()
</script>

<div class="workbench-browse">
  {#if application}
    <div class="captionContainer">
      <span class="caption-1" style="padding-right:1em">{application.label}</span>&nbsp;
      <div style="flex-grow:1"></div>
      <EditBox icon={workbench.icon.Finder} placeholder="Поиск по {application.label}..." iconRight="true" />
    </div>
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
