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
  import { Reference } from '@anticrm/domains'
  import { Message } from '../..'
  import { onDestroy } from 'svelte'

  import CommentComponent from './Comment.svelte'
  import { createLiveQuery, updateLiveQuery } from '@anticrm/presentation'

  export let backlink: Reference

  let message: Message

  const qs = createLiveQuery(backlink._sourceClass, { _id: backlink._sourceId }, (docs) => {
    message = docs[0] as Message
  }, onDestroy)

  $: updateLiveQuery(qs, backlink._sourceClass, { _id: backlink._sourceId })
</script>

{#if message && message.comments && message.comments.length > backlink._sourceProps.pos}
  <CommentComponent message={message.comments[backlink._sourceProps.pos]} />
{/if}
