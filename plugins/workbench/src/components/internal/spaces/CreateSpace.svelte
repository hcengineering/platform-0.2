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
  import type { Property, StringProperty } from '@anticrm/core'
  import { CORE_CLASS_DOC } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import type { AttrModel, ClassModel } from '@anticrm/presentation'
  import { getCoreService, getPresentationService } from '@anticrm/presentation'
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import type { WorkbenchApplication } from '@anticrm/workbench'
  import workbench from '@anticrm/workbench'
  import { CORE_CLASS_SPACE } from '@anticrm/domains'

  export let application: WorkbenchApplication

  let makePrivate = false
  let title = ''
  let description = ''
  let spaceKey = ''
  let spaceKeyChanged = false

  const dispatch = createEventDispatcher()
  const coreService = getCoreService()

  async function save () {
    const cs = await coreService
    const space = {
      name: title as StringProperty,
      description: description as StringProperty,
      application: application._id,
      isPublic: !makePrivate as Property<boolean, boolean>,
      spaceKey: spaceKey as StringProperty,
      users: [
        {
          userId: cs.getUserId() as StringProperty,
          owner: true as Property<boolean, boolean>
        }
      ]
    }
    await cs.create(CORE_CLASS_SPACE, space)
    dispatch('close')
  }

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = getPresentationService()

  $: {
    presentationService.then((ps) =>
      ps.getClassModel(CORE_CLASS_SPACE, CORE_CLASS_DOC).then((m) => {
        const mp = m.filterPrimary()
        model = mp.model
        primary = mp.primary
      })
    )
  }

  function updateSpaceKey () {
    if (spaceKeyChanged) {
      return
    }

    let sk = title.toUpperCase().replace(/[^a-z0-9]/gim, '_')

    while (true) {
      const l = sk.length
      sk = sk.replaceAll('__', '_')
      if (sk.length === l) {
        break
      }
    }
    spaceKey = sk
  }
</script>

<div class="space-view">
  <div class="header">
    <div class="caption-1">Create {makePrivate ? 'private ' : ''} {application.spaceTitle}</div>
    <a href="/" on:click|preventDefault={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button="true" />
    </a>
  </div>

  <div class="content">
    <form class="form">
      <div class="input-container">
        <EditBox
          id="create_space__input__name"
          bind:value={title}
          label="Name"
          placeholder={`A ${application.spaceTitle} Name`}
          on:change={updateSpaceKey} />
      </div>
      <div class="input-container">
        <EditBox
          id="create_space__input__shortId"
          bind:value={spaceKey}
          label={(application.spaceTitle || '') + ' Key'}
          placeholder={`A ${application.spaceTitle} Key (will be used with short ids)`}
          on:change={() => (spaceKeyChanged = true)} />
      </div>
      <div class="input-container">
        <EditBox
          id="create_space__input__description"
          bind:value={description}
          label="Description"
          placeholder={`Write a ${application.spaceTitle} description`} />
      </div>
      <CheckBox bind:checked={makePrivate}>
        Create a private {application.spaceTitle}
      </CheckBox>
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
    padding: 24px;
    position: relative;

    .header {
      display: flex;
      align-items: center;
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
