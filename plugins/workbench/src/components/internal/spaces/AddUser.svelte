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

  import IconButton from '@anticrm/platform-ui/src/components/IconButton.svelte'
  import workbench from '@anticrm/workbench'
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'

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
    padding: 1em 1.5em;
    position: relative;


    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5em;

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

    .attributes {
      display: flex;
      flex-wrap: wrap;
      margin-top: 1em;
    }

    .separator {
      width: 1em;
    }

    .space-kind {
      width: 1em;
      text-align: right;
    }

    .space-caption-1 {
      display: flex;
    }

    .content {
      display: flex;
      flex-direction: column;

      .form {
        .input-container {
          display: flex;
          flex-direction: column;
          margin-bottom: 1em;

          .input-label {
            font-weight: 500;
            margin-bottom: 0.25em;
            color: var(--theme-content-color);

            & > span {
              color: var(--theme-content-trans-color);
              font-size: 11px;
              font-weight: normal;
            }
          }
        }

        .checkbox-label {
          font-weight: 500;

          & > span {
            display: block;
            font-size: 11px;
            font-weight: normal;
            max-width: 20em;
          }
        }

        .buttons {
          margin-top: 1.5em;
          width: 100%;
          display: flex;
          flex-direction: row-reverse;
        }
      }
    }
  }
</style>

<div class='add-user-space-view'>
  <div class='header'>
    <div class='caption-1'>Add user to {space.name}</div>
    <a href='/' on:click|preventDefault={() => dispatch('close')}>
      <IconButton icon={workbench.icon.Close} />
    </a>
  </div>

  <div class='content'>
    <form class='form'>
      <div class='input-container'>
        <label class='input-label' for='input__name'>
          User Name
        </label>
        <EditBox id='input__name' bind:value={userName} />
        <!-- <input type='text' class='editbox input__name' id='input__name' bind:value={userName}> -->
      </div>
      <CheckBox bind:checked={isOwner} right='true'>
        <div class='checkbox-label'>
          Make owner <span>When defined user will have all rights to space.</span>
        </div>
      </CheckBox>
      <div class='buttons'>
        <button type='button' class='button primary' on:click={() => save()}>Create</button>
      </div>
    </form>
  </div>
</div>
