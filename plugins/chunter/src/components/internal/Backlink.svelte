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
  import { Backlink } from '@anticrm/core'
  import { getCoreService } from '@anticrm/platform-ui'
  import { Message } from '../..'
  import { onDestroy } from 'svelte'

  import CommentComponent from './Comment.svelte'

  export let backlink: Backlink

  let message: Message

  getCoreService().subscribe(backlink._backlinkClass, { _id: backlink._backlinkId }, (docs) => {
    message = docs[0] as Message
  }, onDestroy)
</script>

{#if message && message.comments && message.comments.length > backlink.pos}
  <CommentComponent message={message.comments[backlink.pos]} />
{/if}
