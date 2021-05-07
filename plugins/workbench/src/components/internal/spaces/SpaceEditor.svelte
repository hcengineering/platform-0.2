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
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import type { WorkbenchApplication } from '@anticrm/workbench'
  import { Space } from '@anticrm/domains'

  export let application: WorkbenchApplication
  export let space: Space
  export let makePrivate: boolean = !space.isPublic

  let spaceKeyChanged = false
  let isPrivate = false
  $: space.isPublic = !isPrivate
  $: makePrivate = isPrivate

  function updateSpaceKey () {
    if (spaceKeyChanged) {
      return
    }

    let sk = space.name.toUpperCase().replace(/[^a-z0-9]/gim, '_')

    while (true) {
      const l = sk.length
      sk = sk.replaceAll('__', '_')
      if (sk.length === l) {
        break
      }
    }
    space.spaceKey = sk
  }
</script>

<form class="form">
  <div class="input-container">
    <EditBox
      id="create_space__input__name"
      bind:value={space.name}
      label="Name"
      placeholder={`A ${application.spaceTitle} Name`}
      on:change={updateSpaceKey} />
  </div>
  <div class="input-container">
    <EditBox
      id="create_space__input__shortId"
      bind:value={space.spaceKey}
      label={(application.spaceTitle || '') + ' Key'}
      placeholder={`A ${application.spaceTitle} Key (will be used with short ids)`}
      on:change={() => (spaceKeyChanged = true)} />
  </div>
  <div class="input-container">
    <EditBox
      id="create_space__input__description"
      bind:value={space.description}
      label="Description"
      placeholder={`Write a ${application.spaceTitle} description`} />
  </div>
  <CheckBox bind:checked={isPrivate}>
    Create a private {application.spaceTitle}
  </CheckBox>
</form>

<style lang="scss">
  .form {
    .input-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
  }
</style>
