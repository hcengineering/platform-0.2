<script lang='ts'>
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

  import { Ref, Doc } from '@anticrm/core'
  import { find } from '../../utils'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench, { WorkbenchApplication } from '../..'
  // import ActivityView from './ActivityView.svelte'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'

  let application: Ref<Doc>
  let applications: WorkbenchApplication[] = []
  find(workbench.class.WorkbenchApplication, {}).then((docs) => {
    applications = docs
  })

  let classes: Ref<Class<VDoc>>[]

  $: classes = applications.map((a) => a.classes).flat()

  let showMenu = false

  import { createEventDispatcher } from 'svelte'
  import { Class } from '@anticrm/core'
  import { VDoc } from '@anticrm/domains'

  const dispatch = createEventDispatcher()

  function handleSubmit (value: any) {
    dispatch('message', value)
  }
</script>

<div class='input-control'>
  <ReferenceInput on:message='{(e) => handleSubmit(e.detail)}'>
    <div slot='top'>
      <!-- <CreateForm
        v-if="component !== ''"
        :component="component"
        :_class="createItem.itemClass"
        :title="createItem.label"
        @done="done" /> -->
    </div>
    <div slot='inner'>
      <!-- <CreateMenu :visible="showMenu" @select="selectItem" />
      <a class="add-button" href="#" @click.prevent="add">
        <Icon :icon="workbench.icon.Add" class="icon-2x" />
      </a> -->
      <a
        class='add-button'
        href='/'
        on:click|preventDefault='{() => (showMenu = !showMenu)}'
      >
        <Icon icon='{workbench.icon.DefaultPerspective}' className='icon-2x' />
      </a>
    </div>
  </ReferenceInput>
</div>

<style lang='scss'>
  #global {
    .input-control {
      width: 100%;

      .add-button {
        display: flex;
      }
    }
  }
</style>
