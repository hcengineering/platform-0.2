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
  export let width = '100%'
  export let label = ''
  export let value = ''
  export let placeholder: string
  export let id: string | undefined = undefined
  export let hoverState = false

  let input: HTMLElement
</script>

<div
  class="editbox"
  class:editbox-label={label !== ''}
  class:editbox-hoverState={hoverState}
  style="width: {width}"
  on:click={input.focus()}>
  {#if label !== ''}
    <div class="wLabel">
      <div class="label">{label}</div>
      <input bind:this={input} {id} type="text" bind:value {placeholder} on:input on:focus on:change />
    </div>
  {:else}
    <input bind:this={input} {id} type="text" bind:value {placeholder} on:input on:focus on:change />
  {/if}
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  input {
    border: none;
    width: calc(100% - 2px);
    padding: 0;
    background-color: transparent;
    font: inherit;
    &:focus {
      outline: none;
    }
  }
  :global(.theme-dark) input {
    color: $theme-dark-content-color;
  }
  :global(.theme-grey) input {
    color: $theme-grey-content-color;
  }
  :global(.theme-light) input {
    color: $theme-light-content-color;
  }

  .editbox {
    border: solid 1px transparent;
    border-radius: 12px;
    padding: 8px 16px;
    box-sizing: border-box;
    font-size: 15px;
    font-weight: 400;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus-within {
      outline: none;
    }
    &-label {
      height: 54px;
      padding: 6px 16px 4px;
    }
  }
  :global(.theme-dark) .editbox {
    border-color: $theme-dark-bg-accent-color;
    background-color: $theme-dark-bg-accent-color;
    color: $theme-dark-content-color;
    &:focus-within {
      background-color: $theme-dark-bg-accent-hover;
      border-color: $theme-dark-bg-dark-hover;
      color: $theme-dark-content-color;
    }
    &-hoverState {
      background-color: $theme-dark-bg-accent-hover;
      border-color: $theme-dark-bg-dark-hover;
      color: $theme-dark-content-color;
    }
  }
  :global(.theme-grey) .editbox {
    border-color: $theme-grey-bg-accent-color;
    background-color: $theme-grey-bg-accent-color;
    color: $theme-grey-content-color;
    &:focus-within {
      background-color: $theme-grey-bg-accent-hover;
      border-color: $theme-grey-bg-dark-hover;
      color: $theme-grey-content-color;
    }
    &-hoverState {
      background-color: $theme-grey-bg-accent-hover;
      border-color: $theme-grey-bg-dark-hover;
      color: $theme-grey-content-color;
    }
  }
  :global(.theme-light) .editbox {
    border-color: $theme-light-bg-accent-color;
    background-color: $theme-light-bg-accent-color;
    color: $theme-light-content-color;
    &:focus-within {
      background-color: $theme-light-bg-accent-hover;
      border-color: $theme-light-bg-dark-hover;
      color: $theme-light-content-color;
    }
    &-hoverState {
      background-color: $theme-light-bg-accent-hover;
      border-color: $theme-light-bg-dark-hover;
      color: $theme-light-content-color;
    }
  }

  .wLabel {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .label {
    font-size: 11px;
    font-weight: 400;
    margin: 2px 0 6px;
  }
  :global(.theme-dark) .label {
    color: $theme-dark-content-color;
  }
  :global(.theme-grey) .label {
    color: $theme-grey-content-color;
  }
  :global(.theme-light) .label {
    color: $theme-light-content-color;
  }
</style>
