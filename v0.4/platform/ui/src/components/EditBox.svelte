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
  import type { IntlString } from '@anticrm/platform'
  import Label from './Label.svelte'

  export let label: IntlString | undefined
  export let width: string | undefined
  export let value: string | undefined
  export let error: string | undefined
  export let password: boolean | undefined
  export let id: string | undefined
</script>

<div class="editbox{error ? ' error' : ''}" style="{width ? 'width: ' + width : ''}">
  {#if password}
    <input type="password" class:nolabel={!label} {id} bind:value on:keyup placeholder=" "/>
  {:else}
    <input type="text" class:nolabel={!label} {id} bind:value on:keyup placeholder=" "/>
  {/if}
  {#if label}
    <div class="label"><Label label={label}/></div>
  {/if}
  {#if error}
    <div class="error-label">{error}</div>
  {/if}
</div>

<style lang="scss">
  .editbox {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0;
    font-family: inherit;
    min-width: 50px;
    height: 52px;
    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-border-accent-color);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    &:focus-within {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-border-accent-hover);
    }
    input {
      height: 52px;
      margin: 0;
      padding: 14px 20px 0px;
      color: var(--theme-caption-color);
      background-color: transparent;
      outline: none;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      line-height: 17px;
    }
    .nolabel {
      padding-top: 0;
    }
    
    .label {
      position: absolute;
      top: 18px;
      left: 20px;
      font-size: 12px;
      line-height: 14px;
      color: var(--theme-caption-color);
      pointer-events: none;
      opacity: 0.3;
      transition: all 200ms;
    }
    input:focus + .label,
    input:not(:placeholder-shown) + .label {
      top: 10px;
    }
  }
  .error {
    border: 1px solid var(--theme-error-border);
    &:focus-within {
      border-color: var(--theme-error-color);
    }
  }
  .error-label {
    position: absolute;
    top: 52px;
    font-size: 12px;
    color: var(--theme-error-color);
    opacity: 0.7;
  }
</style>
