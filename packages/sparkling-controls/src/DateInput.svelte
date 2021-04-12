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

  .date-input {
    border-radius: 4px;
    padding: 8px 16px;
    box-sizing: border-box;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus-within {
      outline: none;
    }
    &-label {
      height: 54px;
      padding: 6px 16px 4px;
    }
  }
  :global(.theme-dark) .date-input {
    border: 1px solid $theme-dark-bg-dark-color;
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
  :global(.theme-grey) .date-input {
    border: 1px solid $theme-grey-bg-dark-color;
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
  :global(.theme-light) .date-input {
    border: 1px solid $theme-light-bg-dark-color;
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
    align-self: flex-start;
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
