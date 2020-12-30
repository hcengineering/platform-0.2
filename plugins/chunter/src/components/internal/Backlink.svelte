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
  import { Backlink } from '@anticrm/core'
  import { getService } from '@anticrm/platform-ui'
  import core from '@anticrm/platform-core'
  import { Message } from '../..'

  import CommentComponent from './Comment.svelte'

  export let backlink: Backlink

  let message: Message

  const coreService = getService(core.id)

  $: coreService.findOne(backlink._backlinkClass, { _id: backlink._backlinkId }).then((doc: Message) => {
    message = doc
  })
</script>

{#if message && message.comments && message.comments.length > backlink.pos}
  <CommentComponent message={message.comments[backlink.pos]} />
{/if}
