<script lang="ts">
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

  import { onDestroy } from 'svelte'
  import { Property, StringProperty } from '@anticrm/core'
  import chunter, { Collab, getChunterService } from '../index'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import CommentComponent from './internal/Comment.svelte'
  import Backlink from './internal/Backlink.svelte'
  import { CORE_CLASS_REFERENCE, Reference } from '@anticrm/domains'
  import { createLiveQuery, getCoreService, getUserId, updateLiveQuery } from '@anticrm/presentation'

  export let object: Collab

  let references: Reference[] = []

  const refS = createLiveQuery(CORE_CLASS_REFERENCE, { _targetId: object._id }, (docs) => {
    references = docs
  }, onDestroy)

  $: {
    if (object) {
      updateLiveQuery(refS, CORE_CLASS_REFERENCE, { _targetId: object._id })
    }
  }

  const chunterService = getChunterService()
  const coreService = getCoreService()
  async function createComment (message: any): Promise<void> {
    const parsedMessage = (await chunterService).createMissedObjects(message)
    const comment = {
      _class: chunter.class.Comment,
      _createdOn: Date.now() as Property<number, Date>,
      _createdBy: (await coreService).getUserId() as Property<string, string>,
      message: parsedMessage as StringProperty
    }
    await (await coreService).push(object, null, 'comments' as StringProperty, comment)
  }
</script>

{#if references.length > 0 }
  <div class="caption-2">References</div>
  {#each references as ref}
    <Backlink backlink={ref} />
  {/each}
{/if}

<div class="caption-2">Comments</div>

{#if object.comments}
  {#each object.comments as comment}
    <CommentComponent message={comment} />
  {/each}
{/if}

<ReferenceInput on:message={(e) => createComment(e.detail)} />

