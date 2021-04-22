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
  import { createEventDispatcher } from 'svelte'

  export let label: string
  export let primary: boolean = false
  export let width: string

  const dispatch = createEventDispatcher()
  function onClick (event: MouseEvent) {
    dispatch('click', event)
  }
</script>

<button class="button" class:primary={primary} style="{width ? 'width: ' + width : ''}" on:click={onClick}>
  <div>{label}</div>
</button>

<style lang="scss">
  .button {
    height: 48px;
    padding: 0;
    border: none;
    overflow: hidden;
    background-color: var(--theme-bg-accent-color);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    font-family: inherit;
    backdrop-filter: blur(12px);

    div {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 25px;
      width: 100%;
      height: 100%;

      font-size: 14px;
      font-weight: 600;

      color: var(--theme-caption-color);
      border: 1px solid var(--theme-border-accent-color);
      border-radius: 10px;
      &:hover {
        background-color: var(--theme-bg-accent-hover);
        border: 1px solid var(--theme-border-accent-hover);
      }
      &:active {
        background-color: var(--theme-bg-accent-active);
        border: 1px solid var(--theme-border-accent-active);
      }
    }
  }

  .primary div {
    background-color: var(--theme-primary-color);
    border: 1px solid var(--theme-primary-border);
    opacity: 1;
    &:hover {
      background-color: var(--theme-primary-color);
      border: 1px solid var(--theme-primary-border);
      opacity: 0.9;
    }
    &:active {
      opacity: 0.8;
    }
  }
</style>
