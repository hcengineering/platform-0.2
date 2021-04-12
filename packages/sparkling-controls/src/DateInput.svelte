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
  import PopupMenu from './menu/PopupMenu.svelte'
  import MonthCalendar from './calendar/MonthCalendar.svelte'

  export let width = '100%'
  export let label = ''
  export let value: Date | undefined = undefined
  export let placeholder: string
  export let hoverState = false
  export let relativeToParent = false
</script>

<PopupMenu width={220} {relativeToParent}>
  <div
    class="date-input"
    class:date-input-label={label !== ''}
    class:date-input-hoverState={hoverState}
    style="width: {width}"
    slot="trigger">
    {#if label !== ''}
      <div class="wLabel">
        <div class="label">{label}</div>
        <input type="text" {placeholder} value={value && value.toDateString()} />
      </div>
    {:else}
      <input type="text" {placeholder} value={value && value.toDateString()} />
    {/if}
  </div>
  <MonthCalendar bind:selectedDate={value} />
</PopupMenu>

<style lang="scss">
  input {
    border: none;
    width: calc(100% - 2px);
    padding: 0;
    background-color: transparent;
    font: inherit;
    color: var(--theme-content-color);
    &:focus {
      outline: none;
    }
  }

  .date-input {
    border-radius: 4px;
    padding: 8px 16px;
    box-sizing: border-box;
    border: 1px solid var(--theme-bg-dark-color);
    background-color: var(--theme-bg-accent-color);
    color: var(--theme-content-color);
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus-within {
      outline: none;
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      color: var(--theme-content-color);
    }
    &-label {
      height: 54px;
      padding: 6px 16px 4px;
    }
    &-hoverState {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      color: var(--theme-content-color);
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
    align-self: flex-start;
    color: var(--theme-content-color);
  }
</style>
