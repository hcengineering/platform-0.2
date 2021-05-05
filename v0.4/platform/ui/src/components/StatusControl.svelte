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
  import type { Status } from '@anticrm/status'
  import { Severity } from '@anticrm/status'
  import Label from './Label.svelte'

  export let status: Status
  export let width: string
</script>

{#if status.severity !== Severity.OK}
<div class="message-container" class:error={status.severity === Severity.ERROR} style="{width ? 'width: ' + width : ''}">
  <div class="icon">
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.6">
        <path d="M8,16c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S12.4,16,8,16z M8,1C4.1,1,1,4.1,1,8c0,3.9,3.1,7,7,7c3.9,0,7-3.1,7-7 C15,4.1,11.9,1,8,1z"/>
        <path d="M8,12.1c0.4,0,0.8-0.3,0.8-0.8S8.4,10.5,8,10.5s-0.8,0.3-0.8,0.8S7.6,12.1,8,12.1z M7.6,9.6h0.8l0.2-6.2H7.5 L7.6,9.6z"/>
      </g>
    </svg>
  </div>
  <div class="message">
    <Label label={status.code} params={status.params}/>
  </div>
</div>
{/if}

<style lang="scss">
  .message-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    color: var(--theme-content-color);
    fill: var(--theme-caption-color);
    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-border-accent-color);
    border-radius: 8px;
    .icon {
      width: 16px;
      height: 16px;
      margin-right: 12px;
    }
    .message {
      font-family: inherit;
      font-size: 12px;
      flex-grow: 1;
    }
  }

  .error {
    color: var(--theme-error-color);
    fill: var(--theme-error-color);
    background-color: var(--theme-button-bg-error);
    border-color: var(--theme-error-message-border);
  }
</style>