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
  import { createEventDispatcher } from 'svelte'

  import type { Ref, Doc } from '@anticrm/core'
  import workbench from '@anticrm/workbench'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import FsmEditor from '../FSMEditor.svelte'

  import type { FSM, FSMService, State, Transition } from '../..'
  import { getFSMService } from '../..'

  const dispatch = createEventDispatcher()

  export let fsm: FSM

  let transitions: Transition[] = []
  let states: Map<Ref<Doc>, State> = new Map()

  let fsmService: FSMService | undefined

  const onClose = () => dispatch('close')

  const init = async () => {
    fsmService = await getFSMService()
  }

  const onSave = async () => {
    if (!fsmService) {
      return
    }

    await fsmService.updateFSM(fsm, transitions, [...states.values()])
    dispatch('close')
  }
</script>

{#await init() then _}
  <div class="root">
    <div class="header">
      <div class="title-container">
        <div class="title">Update FSM</div>
      </div>
      <div class="close" on:click={onClose}>
        <Icon icon={workbench.icon.Close} button={true} />
      </div>
    </div>
    <ScrollView width="100%" height="450px">
      <FsmEditor {fsm} bind:transitions bind:states />
    </ScrollView>
    <div class="footer">
      <Button kind="primary" on:click={onSave} width="100%">Save</Button>
      <Button on:click={() => dispatch('close')} width="100%">Cancel</Button>
    </div>
  </div>
{/await}

<style lang="scss">
  .root {
    display: flex;
    flex-direction: column;

    padding: 24px 32px 32px 32px;
    max-height: 80vh;

    width: 600px;
  }

  .close {
    cursor: pointer;
  }

  .header {
    display: flex;
    justify-content: space-between;

    padding-bottom: 10px;
  }

  .title-container {
    flex: 1;
    min-width: 0;
    max-width: 300px;
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    font-size: 18px;
    font-weight: 500;
  }

  .footer {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 10px;

    width: 100%;
    padding-top: 10px;
  }
</style>
