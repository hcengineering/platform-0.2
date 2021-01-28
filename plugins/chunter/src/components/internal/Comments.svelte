<script lang='ts'>
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
  import chunter, { Collab, Comment } from '../..'
  import { getCoreService, getService } from '@anticrm/platform-ui'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import CommentComponent from './Comment.svelte'
  import Backlink from './Backlink.svelte'
  import { Backlinks, CORE_CLASS_BACKLINKS } from '@anticrm/domains'

  export let object: Collab

  let backlinks: Backlinks[] = []

  getCoreService().subscribe(CORE_CLASS_BACKLINKS, { _objectId: object._id }, (docs) => {
    backlinks = docs
  }, onDestroy)

  getCoreService().subscribe(object._class, { _id: object._id }, (docs) => {
    console.log('MSG update', docs)
    object = docs[0] as Collab
  }, onDestroy)

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

<div class='caption-2'>Comments</div>

{#each object.comments || [] as comment}
  <CommentComponent message={comment} />
{/each}

<ReferenceInput on:message={(e) => createComment(e.detail)} />

<div class='caption-2'>Backlinks</div>

{#each backlinks as backlink}
  <!-- <Backlink {backlink} /> -->
  {#each backlink.backlinks as b}
    <Backlink backlink={b} />
  {/each}
{/each}
