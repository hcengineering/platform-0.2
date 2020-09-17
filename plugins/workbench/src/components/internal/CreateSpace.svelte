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
  import { Space, generateId } from '@anticrm/core'
  import core from '@anticrm/platform-core'
  import { getCoreService } from '../../utils'

  let name: string

  const coreService = getCoreService()

  function createSpace() {
    console.log('create', name)
    const space: Space = {
      _id: generateId(),
      _class: core.class.Space,
      name,
    }
    coreService.then(coreService => coreService.createDoc(space))
  }
</script>

<h1>Создать пространство</h1>
<input type="text" class="editbox" bind:value={ name }/>
<button class="button" on:click={createSpace}>Create</button>
