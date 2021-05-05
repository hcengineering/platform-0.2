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
  import Hashtag from './icons/Hashtag.svelte'
  import Lock from './icons/Lock.svelte'

  import Tim from '../../img/tim.png'
  import Chen from '../../img/chen.png'
  import Elon from '../../img/elon.png'

  // type: 'channel', 'user'
  export let type: string = 'channel'
  export let img: string
  export let title: string = 'Unnamed'
  export let locked: boolean
  export let counter: number = 0

  const photos = [
    { name: 'tim', image: Tim },
    { name: 'chen', image: Chen },
    { name: 'elon', image: Elon },
  ]
</script>

<div class="container">
  <div class="title">
    {#if type === "channel"}
      <div class="icon">
        <svelte:component this={locked ? Lock : Hashtag}/>
      </div>
    {:else}
      <img class="avatar" src={photos.find(item => item.name === img.toLowerCase()).image} alt="Avatar"/>
    {/if}
    <span>{title}</span>
    {#if counter > 0}
      <div class="counter">{counter}</div>
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    height: 36px;
    .title {
      display: flex;
      align-items: center;
      margin: 0 10px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      user-select: none;
      color: var(--theme-content-color);
      cursor: pointer;
      .icon {
        width: 16px;
        min-width: 16px;
        height: 16px;
        margin: 10px 16px 10px 50px;
        border-radius: 4px;
        opacity: .3;
      }
      .avatar {
        width: 24px;
        min-width: 24px;
        height: 24px;
        margin: 6px 8px 6px 50px;
        border-radius: 50%;
      }
      span {
        flex-grow: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .counter {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        min-width: 24px;
        height: 24px;
        border-radius: 50%;
        margin: 6px 10px;
        background-color: #DA5F44;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
      &:hover {
        background-color: var(--theme-button-bg-enabled);
      }
    }
  }
</style>