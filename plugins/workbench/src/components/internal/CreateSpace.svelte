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
  import { VDoc } from '@anticrm/core'
  import core from '@anticrm/platform-core'
  import { getCoreService, getUIService } from '../../utils'

  let name: string

  const coreService = getCoreService()
  const uiService = getUIService()

  function createSpace() {
    console.log(`create space '${name}`)
    uiService.closeModal()

    const space = {
      _class: core.class.Space,
      name
    }

    // absent VDoc fields will be autofilled
    coreService.then(coreService => coreService.createVDoc(space as unknown as VDoc))
  }
</script>

<h1>Создать пространство</h1>
<input type="text" class="editbox" bind:value={ name }/>
<button class="button" on:click={createSpace}>Create</button>
