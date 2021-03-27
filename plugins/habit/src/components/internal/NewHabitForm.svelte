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
  import { Property, Ref } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { AttrModel, ClassModel, getCoreService, getPresentationService } from '@anticrm/presentation'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import UserBox from '@anticrm/platform-ui/src/components/UserBox.svelte'
  import workbench from '@anticrm/workbench'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import { CORE_MIXIN_SHORTID, Space } from '@anticrm/domains'
  import habit, { HABIT_STATUS_OPEN } from '../../index'
  import EditBox from '@anticrm/platform-ui/src/components/EditBox.svelte'
  import chunter, { Comment, getChunterService } from '@anticrm/chunter'

  export let title: string
  let message: string = ''
  export let space: Ref<Space>
  let object = {} as any

  const coreService = getCoreService()
  const dispatch = createEventDispatcher()

  const chunterService = getChunterService()

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = getPresentationService()

  async function save () {
    const cs = await coreService
    let modelDb = cs.getModel()
    const newHabit = modelDb.newDoc(habit.class.Habit, cs.generateId(), {
      title,
      _space: space, ...object,
      status: HABIT_STATUS_OPEN,
      comments: [{
        message: message,
        _class: chunter.class.Comment,
        _createdOn: Date.now() as Property<number, Date>,
        _createdBy: cs.getUserId() as Property<string, string>
      } as Comment]
    })
    try {
      const asShortId = modelDb.cast(newHabit, CORE_MIXIN_SHORTID)
      asShortId.shortId = await cs.genRefId(space)
    } catch (e) {
      // Ignore
      console.log(e)
    }

    object = {}
    // absent VDoc fields will be autofilled
    await cs.create(habit.class.Habit, newHabit)
    dispatch('close')
  }

  let users: Array<{}> = [{
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
    }]
</script>

<style lang="scss">
  .recruiting-view {
    padding: 24px 32px 32px 32px;
    width: 40em;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    margin-bottom: 9px;

    .caption {
      flex-grow: 1;

      .caption-edit {
        width: 100%;
      }
    }

    .actions {
      display: flex;
      flex-grow: 1;
      flex-direction: row-reverse;
      font-size: 10px;

      button {
        margin-left: 0.5em;
      }
    }
  }

  .content {
    .habitLabel {
      color: var(--theme-doclink-color);
      margin-bottom: 16px;
    }

    .separator {
      height: 16px;
    }
  }

  .buttons {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
  }

  .attributes {
    display: flex;
    flex-wrap: wrap;

    //display: grid;
    //background-color: $content-color-dark;
    //grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    //grid-gap: 1px;

    margin-top: 1em;

    .group {
      padding: 0.5em;
      //background-color: $content-bg-color;
    }
  }
</style>

<div class="recruiting-view">
  <div class="header">
    <div class="caption-1 caption">
      <EditBox id="create_habit__input__name" bind:value={title} width="100%"
               label="Name" placeholder="Name" />
    </div>
    <a href="/" style="margin-left:1.5em" on:click|preventDefault={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button="true" />
    </a>
  </div>

  <div class="content">
    <UserBox items={users} />
    <div class="separator"></div>
    <ReferenceInput stylesEnabled={false} submitEnabled={false} lines={10} on:update={ (msg) => {
         chunterService.then( (cs) => {
           message = cs.createMissedObjects(msg.detail)
           })
      }} height="10em" placeholder="Description" />
  </div>

  <div class="buttons">
    <Button kind="primary" on:click={save}>Принять</Button>
    <Button on:click={() => dispatch('close')}>Отказаться</Button>
  </div>
</div>

