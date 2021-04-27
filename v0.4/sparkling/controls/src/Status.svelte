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
  // import { Status, Severity } from '@anticrm/status'

  export let severity: string
  export let message: string
  export let width: string
  let color: string

  color = severity === 'ERROR' ? 'var(--theme-error-color)' : 'var(--theme-caption-color)'
</script>

{#if severity}
<div class="message-container" class:error={severity === 'ERROR'} style="{width ? 'width: ' + width : ''}">
  <div class="icon">
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g opacity="0.6">
        <circle cx="8" cy="8" r="7.5" stroke="{color}"/>
        <path d="M7.9992 12.06C8.4192 12.06 8.7672 11.724 8.7672 11.292C8.7672 10.86 8.4192 10.524 7.9992 10.524C7.5792 10.524 7.2312 10.86 7.2312 11.292C7.2312 11.724 7.5792 12.06 7.9992 12.06ZM7.6272 9.57598H8.3952L8.5632 3.41998H7.4592L7.6272 9.57598Z" fill="{color}"/>
      </g>
    </svg>
  </div>
  <div class="message">
    {message}
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
    background-color: var(--theme-button-bg-error);
    border-color: var(--theme-error-message-border);
  }
</style>