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
  import core, { Space } from '@anticrm/core'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { _getCoreService, getPresentationService } from '../../../utils'
  import { Doc, Property, Ref, StringProperty } from '@anticrm/core'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '@anticrm/workbench'
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  import EditBox from '@anticrm/platform-ui/src/components/EditBox.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  export let space: Space
  let userName: string = ''
  let isOwner: boolean = false

  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  const curentUser = coreService.getUserId()
  const presentationService = getPresentationService()

  async function save () {

    coreService.push(space, null, 'users' as StringProperty, {
      userId: userName as StringProperty,
      owner: isOwner as Property<boolean, boolean>
    })

    dispatch('close')
  }
</script>

<style lang='scss'>
  .add-user-space-view {
    width: 364px;
    padding: 24px;
    position: relative;

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .content {
      display: flex;
      flex-direction: column;

      .form {
        .input-container {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }
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

<div class='add-user-space-view'>
  <div class='header'>
    <div class='caption-1'>Add user to {space.name}</div>
    <a href='/' on:click|preventDefault={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button='true' />
    </a>
  </div>

  <div class='content'>
    <form class='form'>
      <div class='input-container'>
        <EditBox id='input__name' bind:value={userName} width='100%'
                 label='Имя пользователя' />
      </div>
      <CheckBox bind:checked={isOwner}>
        Сделать частным
      </CheckBox>
      <div class="separator"></div>
      <div class='buttons'>
        <Button size='large' kind='primary' width='164px' on:click={() => save()}>Создать</Button>
      </div>
    </form>
  </div>
</div>
