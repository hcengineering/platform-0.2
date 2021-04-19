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
  import type { DateProperty, DocumentValue, Ref, StringProperty } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { getCoreService } from '@anticrm/presentation'
  import UserBox from '@anticrm/platform-ui/src/components/UserBox.svelte'
  import SpaceBox from '@anticrm/platform-ui/src/components/SpaceBox.svelte'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import type { ShortID, Space } from '@anticrm/domains'
  import { CORE_MIXIN_SHORTID } from '@anticrm/domains'
  import task, { Task, TaskStatus } from '../../index'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import { getChunterService } from '@anticrm/chunter'

  export let title: string
  let message = ''
  export let spaces: Space[]
  let object = {} as any

  let space: Space | undefined = spaces[0]

  const coreService = getCoreService()
  const dispatch = createEventDispatcher()

  const chunterService = getChunterService()

  async function save () {
    const cs = await coreService
    const modelDb = cs.getModel()
    const newTask = {
      title: title as StringProperty,
      _space: space?._id as Ref<Space>,
      ...object,
      status: TaskStatus.Open,
      _createdOn: Date.now() as DateProperty,
      _createdBy: cs.getUserId() as StringProperty,
      comments: [
        {
          message: message,
          _createdOn: Date.now() as DateProperty,
          _createdBy: cs.getUserId() as StringProperty
        }
      ]
    } as DocumentValue<Task>

    const taskId = await cs.genRefId(space?._id as Ref<Space>)
    // TODO: We need to figure ouy a better way to specify mixin values with object creation.
    modelDb.mixinDocument<Task, ShortID>(newTask as Task, CORE_MIXIN_SHORTID, {
      shortId: taskId as string
    })

    object = {}
    // absent VDoc fields will be autofilled
    await cs.create<Task>(task.class.Task, newTask)
    dispatch('close')
  }

  const users: Array<unknown> = [
    {
      id: 0,
      url: 'https://platform.exhale24.ru/images/photo-1.png',
      name: 'Александр Алексеенко'
    },
    {
      id: 1,
      url: 'https://platform.exhale24.ru/images/photo-2.png',
      name: 'Андрей Платов'
    },
    {
      id: 2,
      url: 'https://platform.exhale24.ru/images/photo-3.png',
      name: 'Сергей Буевич'
    },
    {
      id: 3,
      url: 'https://platform.exhale24.ru/images/photo-4.png',
      name: 'Андрей Соболев'
    }
  ]
</script>

<div class="recruiting-view">
  {#if spaces && spaces.length > 1}
    <div class="spaceSelector">
      <SpaceBox label="Project" {spaces} bind:space />
    </div>
  {/if}

  <div class="header">
    <div class="caption-1 caption">
      <EditBox id="create_task__input__name" bind:value={title} label="Name" placeholder="Name" />
    </div>
  </div>

  <div class="content">
    <UserBox items={users} />
    <div class="separator" />
    <ReferenceInput
      stylesEnabled={false}
      submitEnabled={false}
      lines={10}
      on:update={(msg) => {
        chunterService.then((cs) => {
          message = cs.createMissedObjects(msg.detail)
        })
      }}
      height="10em"
      placeholder="Description" />
  </div>

  <div class="buttons">
    <Button kind="primary" on:click={save}>Принять</Button>
    <Button on:click={() => dispatch('close')}>Отказаться</Button>
  </div>
</div>

<style lang="scss">
  .recruiting-view {
    width: 40em;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    margin-bottom: 10px;

    .caption {
      flex-grow: 1;
    }
  }

  .buttons {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
  }

  .spaceSelector {
    padding-bottom: 10px;
  }
</style>
