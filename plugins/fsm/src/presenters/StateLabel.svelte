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
  import type { State } from '..'

  export let state: State
</script>

<div class="root" style="background-color: {state.color};">{state.name}</div>

<style lang="scss">
  .root {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 11px;
    font-weight: 500;
    padding: 0px 4px;
    background-color: var(--theme-status-green-color);
    border-radius: 2px;
    color: var(--theme-white-color);
  }
</style>
