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
  import type { WorkbenchApplication } from '../..'
  import workbench from '../..'
  import IconEditBox from '@anticrm/platform-ui/src/components/IconEditBox.svelte'

  export let application: WorkbenchApplication

  let addIcon: HTMLElement
</script>

<div class="workbench-browse">
  {#if application}
    <div class="captionContainer">
      <span class="caption-1" style="padding-right:1em">{application.label}</span>&nbsp;
      <div style="flex-grow:1"></div>
      <IconEditBox icon={workbench.icon.Finder} placeholder="Поиск по {application.label}..." iconRight="true" />
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
  }
</style>
