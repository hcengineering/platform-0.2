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

  export let maxWidth: number = 300
  export let value: string
  export let placeholder: string

  let compute: HTMLElement
  let input: HTMLElement

  function computeSize (ev: Event) {
    let value = (ev.target as any).value
    if (!value || value.length == 0)
      value = placeholder
    if (typeof value === 'string')
      compute.innerHTML = value.replace(/ /g, '&nbsp;')
    const width = compute.clientWidth > maxWidth ? maxWidth : compute.clientWidth
    input.style.width = width + 'px'
  }
</script>

<div class="inline-edit">
  <div class="control">
    <div bind:this={compute} class="compute-width" />
    <input
      style = { 'max-width:' + maxWidth + 'px' }
      bind:this={input}
      type="text"
      bind:value={value}
      {placeholder}
      on:input={computeSize}
      on:focus={computeSize}
      on:change
    />
  </div>
</div>

<style lang="scss">
  
  .inline-edit {
    min-width: 12em;
    display: inline-block;
  }
  
  .control {
    display: inline-flex;
    box-sizing: border-box;

    border: 1px solid transparent;
    border-radius: 2px;

    &:focus-within {
      border-color: var(--theme-highlight-color);
    }

    .compute-width {
      position: absolute;
      white-space: nowrap;
      visibility: hidden;
    }

    input {
      border: none;
      color: inherit;
      background-color: inherit;
      font: inherit;

      &:focus {
        outline: none;
      }
    }
  }
</style>