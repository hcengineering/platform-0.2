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
  import { Space, generateId, SpaceUser } from '@anticrm/core'
  import core from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import presentation from '@anticrm/presentation'
  import { getPresentationService, getComponentExtension, _getCoreService } from '../../../utils'
  import { AttrModel, ClassModel } from '@anticrm/presentation'
  import AttributeEditor from '@anticrm/presentation/src/components/AttributeEditor.svelte'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import { getSpaceName } from './utils'
  import { AnyLayout, Property, StringProperty } from '@anticrm/model'
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'

  import IconButton from '@anticrm/platform-ui/src/components/IconButton.svelte'
  import workbench from '@anticrm/workbench'

  let makePrivate: boolean = false
  let title: string = ''
  let description: string = ''

  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  async function save () {
    const space = {
      name: title as StringProperty,
      description: description as StringProperty,
      isPublic: !makePrivate as Property<boolean, boolean>,
      users: [
        {
          userId: coreService.getUserId() as StringProperty,
          owner: true as Property<boolean, boolean>
        }
      ]
    }
    coreService.create(core.class.Space, space)
    dispatch('close')
  }

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = getPresentationService()
  console.log('presentationService', presentationService)

  $: {
    presentationService.then((ps) =>
      ps.getClassModel(core.class.Space, core.class.Doc).then((m) => {
        const mp = m.filterPrimary()
        model = mp.model
        primary = mp.primary
      })
    )
  }
</script>

<style lang='scss'>
  .space-view {
    padding: 1em 1.5em;
    position: relative;
  }

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
</style>

<div class='space-view'>
  <div class='header'>
    <div class='caption-1'>Create a new {(makePrivate) ? 'private ' : ''}Space</div>
    <a href='/' on:click|preventDefault={() => dispatch('close')}>
      <IconButton icon={workbench.icon.Close} />
    </a>
  </div>

  <div class='content'>
    <form class='form'>
      <div class='input-container'>
        <label class='input-label' for='input__name'>
          Name
        </label>
        <EditBox bind:value={title} />
      </div>
      <div class='input-container'>
        <label class='input-label' for='input__description'>
          Description <span>(optional)</span>
        </label>
        <EditBox bind:value={description} />
      </div>
      <CheckBox bind:checked={makePrivate} right='true'>
        <div class='checkbox-label'>
          Make private <span>When a channel is set to private, it can only be viewed or joined by invitation.</span>
        </div>
      </CheckBox>
      <div class='buttons'>
        <button type='button' class='button primary' on:click={() => save()}>Create</button>
      </div>
    </form>
  </div>
</div>
