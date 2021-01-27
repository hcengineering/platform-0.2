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
  import Icon from './Icon.svelte'
  import { Asset } from "@anticrm/platform-ui";

  export let icon: Asset | undefined  
  export let width: string = '300px'
  export let value: string
  export let placeholder: string
  export let right: boolean = false

  let input: HTMLElement
</script>

<div class="editbox wIcon" style='width: {width}' on:click={input.focus()}>
  {#if (!right)}
    <Icon {icon} clazz="icon-embed" />
    <div class="separator"></div>
  {/if}
  <input
    bind:this={input}
    type="text"
    bind:value={value}
    {placeholder}
    on:input
    on:focus
    on:change
  />
  {#if (right)}
    <div class="separator"></div>
    <Icon {icon} clazz="icon-embed" />
  {/if}
</div>

<style lang="scss">
  .wIcon {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .separator {
    width: 7px;
  }

  input {
    border: none;
    width: 100%;
    color: var(--theme-content-color);
    background-color: transparent;
    font: inherit;

    &:focus {
      outline: none;
    }
  }
</style>