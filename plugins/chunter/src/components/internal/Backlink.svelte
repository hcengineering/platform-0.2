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
  import type { Reference } from '@anticrm/domains'
  import type { Message } from '../..'

  import CommentComponent from './Comment.svelte'
  import { liveQuery } from '@anticrm/presentation'
  import { QueryUpdater } from '@anticrm/platform-core'
  import type { Class, Ref } from '@anticrm/core'

  export let backlink: Reference

  let message: Message
  let qs: Promise<QueryUpdater<Message>>
  $: qs = liveQuery<Message>(qs, backlink._sourceClass as Ref<Class<Message>>, { _id: backlink._sourceId }, (docs) => {
    message = docs[0]
  })
</script>

{#if message && message.comments && message.comments.length > backlink._sourceProps.pos}
  <CommentComponent message={message.comments[backlink._sourceProps.pos]} />
{/if}
