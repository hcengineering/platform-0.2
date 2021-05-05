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
  import { EditBox } from '@anticrm/ui'
  import MoreH from './icons/MoreH.svelte'
  import Add from './icons/Add.svelte'

  export let title: string
  export let subtitle: string
</script>

<div class="header">
  <div class="icon"></div>
  <div class="caption">
    <div class="title">{title}</div>
    <div class="subtitle">{subtitle}</div>
  </div>
  <div class="separator"/>
  <EditBox label="Search" width="180px"/>
  <div class="buttons">
    <div class="button"><MoreH/></div>
    <div class="button"><Add/></div>
  </div>
</div>

<style lang="scss">
  .header {
    width: 100%;
    height: 80px;
    min-height: 80px;
    border-bottom: 1px solid var(--theme-menu-divider);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px 0 40px;

    .icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      border-radius: 4px;
      background-color: var(--primary-color-pink);
      margin-right: 16px;
    }
    .caption {
      max-width: 220px;
      color: var(--theme-caption-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 16px;
      
      .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 16px;
        font-weight: 500;
      }
      .subtitle {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        opacity: .3;
      }
    }
    .separator {
      flex-grow: 1;
    }
    .buttons {
      display: flex;
      flex-direction: row-reverse;
      margin-left: 24px;
      .button {
        width: 24px;
        height: 24px;
        opacity: .4;
      }
      .button + .button {
        margin-right: 16px;
      }
    }
  }
</style>