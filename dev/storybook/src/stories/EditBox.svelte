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
  import { createEventDispatcher } from 'svelte';

  export let width: string = '300px'
  export let value: string
  export let placeholder: string
  export let id: string

  let input: HTMLElement

  const dispatch = createEventDispatcher();
  function onInput(event) {
    dispatch('input', event);
  }
  function onFocus(event) {
    dispatch('focus', event);
  }
  function onChange(event) {
    dispatch('change', event);
  }
</script>

<div class="editbox" style='width: {width}' on:click={input.focus()}>
  <input
    bind:this={input}
    id={id}
    type="text"
    bind:value={value}
    {placeholder}
    on:input={onInput}
    on:focus={onFocus}
    on:change={onChange}
  />
</div>

<style lang="scss">
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

  .editbox {
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 8px 16px;
    background-color: var(--theme-bg-accent-color);
    box-sizing: border-box;
    color: var(--theme-content-color);
    transition: border-color .2s, color .2s, background-color .2s;

    &:focus-within {
      outline: none;
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      color: var(--theme-content-color);
    }
  }
</style>
