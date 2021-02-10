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
  import { Ref, Class, Doc, Property, Emb, StringProperty } from '@anticrm/core'
  import chunter, { Collab, Comment } from '../index'
  import { getCoreService, getService } from '@anticrm/platform-ui'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import CommentComponent from './internal/Comment.svelte'
  import Backlink from './internal/Backlink.svelte'
  import { Reference, CORE_CLASS_REFERENCE } from '@anticrm/domains'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  export let object: Collab

  let references: Reference[] = []

  const refS = getCoreService().subscribe(CORE_CLASS_REFERENCE, { _targetId: object._id }, (docs) => {
    references = docs
  }, onDestroy)

  $: {
    if (object) {
      refS(CORE_CLASS_REFERENCE, { _targetId: object._id })
    }
  }

  const coreService = getCoreService()
  const chunterService = getService(chunter.id)

  function createComment (message: any): Promise<void> {
    const parsedMessage = chunterService.createMissedObjects(message)
    const comment = {
      _class: chunter.class.Comment,
      _createdOn: Date.now() as Property<number, Date>,
      _createdBy: coreService.getUserId() as Property<string, string>,
      message: parsedMessage as StringProperty
    }
    return coreService.push(object, null, 'comments' as StringProperty, comment).then()
  }
</script>

{#if references.length > 0 }
  <div class="caption-2">References</div>
  {#each references as ref}
    <!-- <Backlink {backlink} /> -->
    <Backlink backlink={ref} />
  {/each}
{/if}

<div class="caption-2">Comments</div>

{#if object && object.comments}
  <ScrollView width="100%" height="20em" accentColor="true">
  {#each object.comments || [] as comment}
    <CommentComponent message={comment} />
  {/each}
  </ScrollView>
{/if}

<ReferenceInput on:message={(e) => createComment(e.detail)} />

