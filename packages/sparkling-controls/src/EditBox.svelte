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
  export let width: string = '300px';
  export let value: string
  export let placeholder: string
  export let id: string

  let input: HTMLElement
</script>

<div class="editbox" style='width: {width}' on:click={input.focus()}>
  <input
    bind:this={input}
    id={id}
    type="text"
    bind:value={value}
    {placeholder}
    on:input
    on:focus
    on:change
  />
</div>

<style lang="scss">
  .inline-edit {
    min-width: 12em;
    display: inline-block;
  }

  input {
    border: none;
    width: calc(100% - 2px);
    color: var(--theme-content-color);
    background-color: transparent;
    font: inherit;

    &:focus {
      outline: none;
    }
  }
</style>
