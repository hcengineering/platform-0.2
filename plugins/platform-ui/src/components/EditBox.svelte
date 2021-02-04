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

  export let icon: Asset | undefined = undefined
  export let width: string = '300px'
  export let id: string
  export let value: string
  export let placeholder: string = ''
  export let label: string = ''
  export let iconRight: boolean = false

  let input: HTMLElement
</script>

<div class="editbox wIcon" class:editbox-label={(label !== '')} style='width: {width}' on:click={input.focus()}>
  {#if ((!iconRight) && (typeof(icon) !== 'undefined'))}
    <Icon {icon} />
    <div class="separator"></div>
  {/if}
  {#if (label !== '')}
    <div class="wLabel">
      <div class="label">{label}</div>
      <input bind:this={input} {id} type="text"
        bind:value={value} {placeholder}
        on:input on:focus on:change
      />
    </div>
  {:else}
    <input bind:this={input} {id} type="text"
      bind:value={value} {placeholder}
      on:input on:focus on:change
    />
  {/if}
  {#if ((iconRight) && (typeof(icon) !== 'undefined'))}
    <div class="separator"></div>
    <Icon {icon} />
  {/if}
</div>

<style lang="scss">
  .wIcon {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .wLabel {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .label {
    color: var(--theme-content-color);
    font-size: 11px;
    font-weight: 400;
    margin-bottom: 4px;
  }
  .separator {
    width: 7px;
  }

  input {
    border: none;
    width: 100%;
    margin-left: -2px;
    color: var(--theme-content-dark-color);
    background-color: transparent;
    font: inherit;

    &:focus {
      outline: none;
    }
  }
</style>