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
<script lang='ts'>
  import { Space, SpaceUser } from '@anticrm/core'
  import core from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { getPresentationService, _getCoreService, getCoreService } from '../../../utils'
  import { getSpaceName, getCurrentUserSpace } from './utils'
  import { onDestroy } from 'svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { Doc, Property, Ref, StringProperty } from '@anticrm/model'

  import { leaveSpace, joinSpace, archivedSpaceUpdate } from './utils'

  const dispatch = createEventDispatcher()
  let spaceUnsubscribe: () => void | undefined
  let spaces: Space[ ] = []
  let filter: string
  let hoverSpace: Ref<Doc>

  const coreService = _getCoreService()
  const curentUser = coreService.getUserId()
  const qr = coreService.query(core.class.Space, {})

  spaceUnsubscribe = qr.subscribe((docs) => {
    console.log('spaces:', docs)
    spaces = docs
  })

  const presentationService = getPresentationService()
  onDestroy(() => {
    if (spaceUnsubscribe) spaceUnsubscribe()
  })
</script>

<div class='space-browse-view'>
  <div class='header'>
    <div class='caption-4'>Space browser</div>
    <div class='actions'>
      <button class='button' on:click={() => dispatch('close')}>Cancel</button>
      <div class='separator' />
      <button class='button' on:click={() => dispatch('create')}>Create space</button>
    </div>
  </div>

  <div class='content'>
    <ScrollView stylez='height:90%;'>
      {#each spaces as s (s._id)}
        <div class='space' on:mouseover={() => (hoverSpace = s._id)}>
          <div class='info'>
            <div class='caption-2'>{getSpaceName(s)}</div>
            Members:
            {s.users !== undefined ? s.users.length : 0}
            <br />
            {getCurrentUserSpace(curentUser, s) ? 'Joined' : ''}
            {s.archived ? 'Archived' : ''}
          </div>
          <div class='actions'>
            {#if hoverSpace === s._id}
              {#if getCurrentUserSpace(curentUser, s)}
                {#if s.isPublic || !getCurrentUserSpace(curentUser, s).owner  }
                  <button class='button' on:click={() => leaveSpace(coreService, s)}>
                    Leave
                  </button>
                {:else}
                  <button class='button' on:click={() => archivedSpaceUpdate(coreService, s, !s.archived)}>
                    {s.archived ? 'Unarchive' : 'Archive'}
                  </button>
                {/if}
              {:else}
                <button class='button' on:click={() =>  joinSpace(coreService, s)}>
                  Join
                </button>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </ScrollView>
  </div>
</div>

<style lang='scss'>
  .space-browse-view {
    margin: 1em;
    height: 20em;
    width: 30em;

    .header {
      display: flex;

      .actions {
        display: flex;
        flex-grow: 1;
        flex-direction: row-reverse;
        font-size: 10px;

        button {
          margin-left: 0.5em;
        }
      }
    }

    .separator {
      width: 1em;
    }

    .content {
      // width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;

      .space {
        display: flex;
        flex-direction: row;
        border-bottom: #313131 1px solid;
        padding: 0.5em;
        color: var(--theme-content-color);

        .info {
          flex-grow: 1;
        }

        .actions {
          display: flex;
          align-items: center;
        }
      }

      .space:hover {
        color: var(--theme-doclink-color);
        background-color: var(--theme-editbox-bg-color);
      }
    }
  }
</style>
