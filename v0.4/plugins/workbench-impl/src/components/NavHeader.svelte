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
  import logo from '../../img/voltron.png'
  import ArrowUp from './icons/Up.svelte'
  import ArrowDown from './icons/Down.svelte'

  export let title: string = 'Company name'
  let arrow: string = 'down'
</script>

<div class="company">
  <div class="title" on:mouseover={() => {arrow = "up"}} on:mouseout={() => {arrow = "down"}}>
    <div class="logo"><img src={logo} alt="logo"></div>
    <span>{title}</span>
    <div class="arrow">
      <svelte:component this={arrow === 'down' ? ArrowDown : ArrowUp}/>
    </div>
  </div>
</div>

<style lang="scss">
  .company {
    width: 100%;
    height: 80px;
    padding: 28px 10px 4px;
    .title {
      display: flex;
      align-items: center;
      height: 48px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      color: var(--theme-caption-color);
      .logo {
        width: 32px;
        height: 32px;
        margin: 8px 16px 8px 18px;
        border-radius: 4px;
      }
      span {
        flex-grow: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .arrow {
        width: 16px;
        min-width: 16px;
        height: 16px;
        border-radius: 4px;
        margin: 16px 14px;
      }
      &:hover {
        background-color: var(--theme-button-bg-enabled);
      }
    }
  }
</style>