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
  import BrowseSpace from './BrowseSpace.svelte'
  import CreateSpace from './CreateSpace.svelte'
  import SimplePopup from '@anticrm/presentation/src/components/SimplePopup.svelte'

  enum Mode {
    Select,
    Create,
    Browse
  }

  let mode: Mode = Mode.Select
  let actions = [{
    name: 'Create',
    action: () => mode = Mode.Create
  }, {
    name: 'Browse',
    action: () => mode = Mode.Browse
  }]
</script>

{#if mode == Mode.Select}
  <SimplePopup items={actions}></SimplePopup>
{:else if mode == Mode.Create}
  <CreateSpace on:close on:browse={() => (mode = Mode.Browse)} />
{:else if mode == Mode.Browse}
  <BrowseSpace on:close on:create={() => (mode = Mode.Create)} />
{/if}
