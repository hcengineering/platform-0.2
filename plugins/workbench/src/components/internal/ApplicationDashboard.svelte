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
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import { getUIService } from '@anticrm/platform-ui'

  import IconEditBox from '@anticrm/platform-ui/src/components/IconEditBox.svelte'

  import CreateControl from './CreateControl.svelte'
  import CreateForm from './CreateForm.svelte'
  import { CORE_CLASS_SPACE, Space } from '@anticrm/domains'
  import { Ref } from '@anticrm/core'

  export let application: WorkbenchApplication

  const coreP = getCoreService()
  const uiService = getUIService()

  let creators: ItemCreator[] = []
  let creatorsQuery: Promise<QueryUpdater<ItemCreator>>

  $: if (application) {
    creatorsQuery = liveQuery<ItemCreator>(
      creatorsQuery,
      workbench.class.ItemCreator,
      { app: application._id as Ref<WorkbenchApplication> },
      (docs) => {
        creators = docs
      }
    )
  }

  let spaces: Space[] = []
  let spacesQuery: Promise<QueryUpdater<Space>>
  let userId: string | undefined

  coreP.then((core) => {
    userId = core.getUserId()
  })

  $: if (userId && application) {
    spacesQuery = liveQuery<Space>(spacesQuery, CORE_CLASS_SPACE, { application: application._id }, (docs) => {
      spaces = docs.filter((x) => x.users.some((x) => x.userId === userId))
    })
  }

  const onCreatorClick = (creator: ItemCreator) => uiService.showModal(CreateForm, { application, creator, spaces })
</script>

<div class="workbench-browse">
  {#if application}
    <div class="captionContainer">
      <span class="caption-1" style="padding-right:1em">{application.label}</span>&nbsp;
      {#if spaces.length > 0}
        <CreateControl {creators} {onCreatorClick} />
      {/if}
      <div style="flex-grow:1" />
      <IconEditBox
        icon={workbench.icon.Finder}
        placeholder="Поиск по {application.label}..."
        iconRight={true}
        value="" />
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--theme-bg-accent-color);
    }
  }
</style>
