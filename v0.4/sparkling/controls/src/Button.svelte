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
  import Spinner from './Spinner.svelte'
  import { createEventDispatcher } from 'svelte'

  export let label: string = ''
  export let primary: boolean = false
  export let disabled: boolean = false
  export let loading: boolean = false
  export let width: string

  const dispatch = createEventDispatcher()
  function onClick (event: MouseEvent) {
    dispatch('click', event)
  }

  if (loading) disabled = true
</script>

<button class="button" class:primary={primary} class:loading={loading} {disabled}
        style="{width ? 'width: ' + width : ''}" on:click={onClick}>
  {#if loading}
    <div class="spinner"><Spinner/></div>
  {/if}
  {label}
</button>

<style lang="scss">
  .container {
    position: relative;
  }
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 0 25px;
    color: var(--theme-caption-color);
    background-color: var(--theme-button-bg-enabled);
    border: 1px solid var(--theme-button-border-enabled);
    border-radius: 12px;
    outline: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    backdrop-filter: blur(12px);
    &:hover {
      background-color: var(--theme-button-bg-hovered);
      border-color: var(--theme-button-border-hovered);
    }
    &:focus {
      background-color: var(--theme-button-bg-focused);
      border-color: var(--theme-button-border-focused);
    }
    &:active {
      background-color: var(--theme-button-bg-pressed);
      border-color: var(--theme-button-border-pressed);
    }
    &:disabled {
      background-color: var(--theme-button-bg-disabled);
      border-color: var(--theme-button-border-disabled);
      color: rgb(var(--theme-caption-color) / 40%);
      cursor: not-allowed;
    }
  }

  .primary {
    background-color: var(--theme-primary-enabled);
    border-color: var(--theme-primary-border);
    &:hover {
      background-color: var(--theme-primary-hovered);
      border-color: var(--theme-primary-border);
    }
    &:focus {
      background-color: var(--theme-primary-focused);
      border-color: var(--theme-primary-border);
      box-shadow: 0 0 0 2px var(--theme-primary-outline);
    }
    &:active {
      background-color: var(--theme-primary-pressed);
      border-color: var(--theme-primary-border);
      box-shadow: none;
    }
    &:disabled {
      background-color: var(--theme-primary-disabled);
      border-color: var(--theme-primary-border);
      color: rgb(var(--theme-caption-color) / 60%);
      cursor: not-allowed;
    }
  }

  .loading {
    background-color: var(--theme-primary-enabled);
    color: var(--theme-caption-color);
    &:disabled {
      background-color: var(--theme-primary-enabled);
      color: var(--theme-caption-color);
      cursor: not-allowed;
    }
  }

  .spinner {
    margin: 0 10px;
  }
</style>
