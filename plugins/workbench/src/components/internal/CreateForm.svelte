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
<script lang='ts'>
  import { Ref, Class, Doc } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { AnyComponent } from '@anticrm/platform-ui'
  import presentation from '@anticrm/presentation'
  import { _getPresentationService, getComponentExtension, _getCoreService } from '../../utils'
  import { AttrModel, ClassModel } from '@anticrm/presentation'

  import AttributeEditor from '@anticrm/presentation/src/components/AttributeEditor.svelte'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import IconButton from '@anticrm/platform-ui/src/components/IconButton.svelte'
  import UserBox from '@anticrm/platform-ui/src/components/UserBox.svelte'
  import workbench from '@anticrm/workbench'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import { CORE_CLASS_VDOC, Space } from '@anticrm/domains'

  export let title: string
  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space>
  let object = {} as any

  let component: AnyComponent
  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  function save () {
    const doc = {
      _class,
      _space: space, ...object
    }
    object = {}
    // absent VDoc fields will be autofilled
    coreService.create (_class, doc)
    dispatch('close')
  }

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = _getPresentationService()
  console.log('presentationService', presentationService)

  $: {
    getComponentExtension (_class, presentation.class.DetailForm).then((ext) => {
      console.log('DETAIL_FORM:', ext)
      component = ext
    })

    presentationService.getClassModel(_class, CORE_CLASS_VDOC).then((m) => {
      const mp = m.filterPrimary()
      model = mp.model
      primary = mp.primary
    })
  }
  
  let users: Array = [{ id: 0, url: 'https://platform.exhale24.ru/images/photo-1.png',
                        name: 'Александр Алексеенко' },
                      { id: 1, url: 'https://platform.exhale24.ru/images/photo-2.png',
                        name: 'Андрей Платов'},
                      { id: 2, url: 'https://platform.exhale24.ru/images/photo-3.png',
                        name: 'Сергей Буевич'},
                      { id: 3, url: 'https://platform.exhale24.ru/images/photo-4.png',
                        name: 'Андрей Соболев'}]
</script>

<style lang='scss'>
  .recruiting-view {
    padding: 1em 1.5em;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    margin-bottom: 0.5em;

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
    .taskLabel {
      color: var(--theme-doclink-color);
      margin-bottom: 1em;
    }

    .separator {
      height: 1em;
    }
  }

  .buttons {
    margin-top: 1em;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1em;
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

<div class='recruiting-view'>
  <div class='header'>
    <div class='caption-1 caption'>
      <InlineEdit value='Дизайн Конструктора в личном кабинете' fullWidth='true' />
    </div>
    <a href='/' on:click|preventDefault={() => dispatch('close')}>
      <IconButton icon={workbench.icon.Close} style='margin-left:1.5em' />
    </a>
  </div>

  <div class="content">
    <div class="taskLabel">
      DT-925
    </div>
    <UserBox items={users} />
    <div class="separator"></div>
    <ReferenceInput stylesEnabled="true" />
  </div>

  <div class="buttons">
    <button type='button' class='button primary' on:click={save}>Принять</button>
    <button type='button' class='button' on:click={() => dispatch('close')}>Отказаться</button>
  </div>
</div>

<!--<div class='recruiting-view'>
  <div class='header'>
    <div class='caption-4'>{title} : {space}</div>
    <div class='actions'>
      <button
        class='button'
        on:click={() => {
          dispatch('close')
        }}>Cancel
      </button>
      <button class='button' on:click={save}>Save</button>
    </div>
  </div>

  <div class='content'>
    {#if primary}
      <div class='caption-1'>
        <AttributeEditor attribute={primary} bind:value={object[primary.key]} />
      </div>
    {/if}
    {#if model}
      <Properties {model} bind:object />
    {/if}
  </div>
</div>
-->
