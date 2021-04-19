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

  import type { Collab } from '../index'
  import chunter, { getChunterService } from '../index'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import CommentComponent from './internal/Comment.svelte'
  import Backlink from './internal/Backlink.svelte'
  import type { Reference } from '@anticrm/domains'
  import { CORE_CLASS_REFERENCE } from '@anticrm/domains'
  import { getCoreService, liveQuery } from '@anticrm/presentation'

  export let object: Collab

  let references: Reference[] = []

  $: refS = liveQuery<Reference>(refS, CORE_CLASS_REFERENCE, { _targetId: object._id }, (docs) => {
    references = docs
  })

  const chunterService = getChunterService()
  const coreService = getCoreService()

  async function createComment (message: any): Promise<void> {
    const parsedMessage = (await chunterService).createMissedObjects(message)
    const comment = {
      _class: chunter.class.Comment,
      _createdOn: Date.now(),
      _createdBy: (await coreService).getUserId(),
      message: parsedMessage
    } as Comment
    await (await coreService).updateWith(object, (s) => s.comments.push(comment))
  }
</script>

{#if references.length > 0}
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
