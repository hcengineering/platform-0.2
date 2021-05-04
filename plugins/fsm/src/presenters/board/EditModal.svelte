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

  import workbench from '@anticrm/workbench'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import FsmEditor from '../FSMEditor.svelte'

  import type { FSM } from '../..'

  const dispatch = createEventDispatcher()

  export let fsm: FSM
</script>

<div class="root">
  <div class="header">
    <div class="title-container">
      <div class="title">Update FSM</div>
    </div>
    <div class="close" on:click={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button={true} />
    </div>
  </div>
  <ScrollView width="100%" height="450px">
    <FsmEditor {fsm} />
  </ScrollView>
</div>

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
</style>
