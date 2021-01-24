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

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '@anticrm/workbench'

  let object = {} as any

  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  async function save () {
    const space = {
      ...object,
      users: [
        {
          userId: coreService.getUserId() as StringProperty,
          owner: true as Property<boolean, boolean>
        } as AnyLayout
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

  let chkBox: boolean = false;
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

    .headIcon {
      align-self: baseline;
      margin-left: 1em;
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
          &>span {
            color: var(--theme-content-trans-color);
            font-size: 11px;
            font-weight: normal;
          }
        }

        .input {
          background-color: var(--theme-bg-color);
          border: solid 1px var(--theme-bg-accent-color);
          border-radius: 4px;
          padding: 0.5em;
          color: var(--theme-caption-color);
          font-size: 14px;
          transition: all .2s ease-in-out;

          &:focus {
            outline: none;
            background-color: var(--theme-bg-color);
            border: solid 1px var(--theme-bg-dark-color);
            box-shadow: 0 0 2px 2px var(--theme-highlight-color);
          }
        }
      }

      .checkbox-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 0.5em;

        .input-label {
          font-weight: 500;
          margin-bottom: 0.25em;
          &>span {
            display: block;
            font-size: 11px;
            font-weight: normal;
            max-width: 20em;
          }
        }

        .checkbox {
          margin-left: 0.5em;
          width: 35px;
          height: 20px;
          border: solid 1px var(--theme-bg-accent-color);
          border-radius: 4px;
          position: relative;
          cursor: pointer;
          transition: all .2s ease-in-out;

          &::before {
            content: '';
            position: absolute;
            background-color: var(--theme-bg-accent-color);
            border-radius: 4px;
            width: 16px;
            height: 16px;
            top: 2px;
            left: 2px;
            transition: all .2s ease-in-out;
          }
          &:hover {
            border: solid 1px var(--theme-bg-dark-color);
            box-shadow: 0 0 2px 2px var(--theme-highlight-color);

            &::before {
              background-color: var(--theme-bg-dark-color);
            }
          }
        }
        .checkbox-label {
          cursor: pointer;
          &:hover ~ .checkbox {
            border: solid 1px var(--theme-bg-dark-color);
            box-shadow: 0 0 2px 2px var(--theme-highlight-color);
          }
          &:hover ~ .checkbox::before {
            background-color: var(--theme-bg-dark-color);
          }
        }
        .active {
          background-color: var(--theme-bg-accent-color);
          border: solid 1px var(--theme-bg-dark-color);

          &::before {
            content: '';
            position: absolute;
            background-color: var(--theme-bg-dark-color);
            border-radius: 4px;
            width: 16px;
            height: 16px;
            top: 2px;
            left: calc(100% - 18px);
            transition: all .2s ease-in-out;
          }
          &::after {
            content: '';
            background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z'/%3E%3C/svg%3E%0A");
            width: 12px;
            height: 12px;
            top: 4px;
            left: 3px;
            position: absolute;
          }
        }
      }

      .buttons {
        margin-top: 1.5em;
        width: 100%;
        display: flex;
        flex-direction: row-reverse;

        .createButton {
          background-color: var(--theme-bg-accent-color);
          border: solid 1px var(--theme-bg-dark-color);
          border-radius: 4px;
          color: var(--theme-content-color);
          font-weight: 500;
          padding: 0.5em 1em;
          cursor: pointer;
          transition: all .3s ease-in-out;

          &:hover {
            border: solid 1px var(--theme-bg-dark-color);
            background-color: var(--theme-bg-dark-color);
            color: var(--theme-caption-color);
            box-shadow: 0 0 2px 2px var(--theme-highlight-color);
          }
          &:focus {
            outline: none;
          }
        }
      }
    }
  }
</style>

<div class='space-view'>
  <div class='header'>
    <div class='caption-1'>Create a new {(chkBox) ? 'private ' : ''}Space</div>
    <div class='headIcon'>
      <a href='/' on:click|preventDefault={() => dispatch('close')}>
        <Icon icon={workbench.icon.Close} clazz='icon-embed' />
      </a>
    </div>
    <!--<div class='actions'>
      <button class='button' on:click={() => dispatch('close')}>Cancel</button>
      <button class='button' on:click={save}>Create</button>
      <div class='separator' />
      <button class='button' on:click={() => dispatch('browse')}>Browse space</button>
    </div>-->
  </div>

  <!--<div class='content'>
    {#if primary}
      <div class='caption-1 space-caption-1'>
        <div class='space-kind'>{getSpaceName(object, false)}</div>
        <AttributeEditor attribute={primary} bind:value={object[primary.key]} />
      </div>
    {/if}
    {#if model}
      <Properties {model} bind:object />
    {/if}
  </div>-->

  <div class="content">
    <form class="form">
      <div class="input-container">
        <label class="input-label" for="input__name">
          Name
        </label>
        <input type="text" class="input input__name" />
      </div>
      <div class="input-container">
        <label class="input-label" for="input__description">
          Description <span>(optional)</span>
        </label>
        <input type="text" class="input input__description" />
      </div>
      <div class="checkbox-container">
        <label class="input-label checkbox-label" for="checkbox" on:click={() => {chkBox = !chkBox}}>
          Make private<span>When a channel is set to private, it can only be viewed or joined by invitation.</span>
        </label>
        <div class="checkbox" class:active={chkBox} on:click={() => {chkBox = !chkBox}}></div>
      </div>
      <div class="buttons">
        <button type="button" class="createButton">Create</button>
      </div>
    </form>
  </div>
</div>
