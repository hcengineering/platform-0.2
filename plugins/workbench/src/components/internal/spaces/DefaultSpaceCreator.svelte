<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import type { Ref } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { getCoreService } from '@anticrm/presentation'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import type { WorkbenchApplication } from '@anticrm/workbench'
  import { Application, CORE_CLASS_SPACE, Space } from '@anticrm/domains'

  import SpaceEditor from './SpaceEditor.svelte'

  export let application: WorkbenchApplication
  export let makePrivate: boolean

  const dispatch = createEventDispatcher()
  const coreService = getCoreService()

  let space: Space = {
    _id: '' as Ref<Space>,
    _class: CORE_CLASS_SPACE,
    name: '',
    description: '',
    application: application._id as Ref<Application>,
    isPublic: true,
    archived: false,
    spaceKey: '',
    users: []
  }

  async function save () {
    const cs = await coreService
    await cs.create(CORE_CLASS_SPACE, {
      ...space,
      users: [
        {
          userId: cs.getUserId(),
          owner: true
        }
      ]
    })
    dispatch('close')
  }
</script>

<div class="space-view">
  <div class="content">
    <form class="form">
      <SpaceEditor bind:space bind:makePrivate {application} />
      <div class="separator" />
      <div class="buttons">
        <Button size="large" kind="primary" width="164px" on:click={() => save()}>Создать</Button>
      </div>
    </form>
  </div>
</div>

<style lang="scss">
  .space-view {
    width: 364px;
    position: relative;

    .content {
      display: flex;
      flex-direction: column;

      .form {
        .separator {
          height: 8px;
          margin: 20px 0;
        }

        .buttons {
          width: 100%;
          display: flex;
          flex-direction: row;
        }
      }
    }
  }
</style>
