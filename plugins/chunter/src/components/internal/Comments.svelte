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
  import { Ref, Class, Doc, Property, Emb } from '@anticrm/model'
  import { getCoreService, query } from '../../utils'
  import core from '@anticrm/core'
  import chunter, { Collab, Comment } from '../..'
  import { getService } from '@anticrm/platform-ui'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import CommentComponent from './Comment.svelte'
  import Backlink from './Backlink.svelte'
  import { Backlinks } from '@anticrm/core'

  export let object: Collab

  let backlinks: Backlinks[] = []
  let unsubscribe: () => void
  $: {
    if (unsubscribe) {
      unsubscribe()
    }
    unsubscribe = query(core.class.Backlinks, { _objectId: object._id }, (docs) => {
      backlinks = docs
    })
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe()
  })

  const coreService = getCoreService()
  const chunterService = getService(chunter.id)

  function createComment(message: any): Promise<void> {
    const parsedMessage = chunterService.createMissedObjects(message)
    return coreService.then((coreService) => {
      const comment = ({
        _class: chunter.class.Comment,
        _createdOn: Date.now() as Property<number, Date>,
        _createdBy: 'john.appleseed@gmail.com' as Property<string, string>,
        message: parsedMessage
      } as unknown) as Emb
      return coreService.push(object, 'comments', comment)
    })
  }
</script>

<div class="caption-2">Comments</div>

{#each object.comments || [] as comment}
  <CommentComponent message={comment} />
{/each}

<ReferenceInput on:message={(e) => createComment(e.detail)} />

<div class="caption-2">Backlinks</div>

{#each backlinks as backlink}
  <!-- <Backlink {backlink} /> -->
  {#each backlink.backlinks as b}
    <Backlink backlink={b} />
  {/each}
{/each}
