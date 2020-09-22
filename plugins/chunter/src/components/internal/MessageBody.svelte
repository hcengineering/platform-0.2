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
  import { parseMessage, MessageElementKind } from '@anticrm/core'
  import { Message } from '../..'

  export let message: Message
</script>

<div>
  { #each parseMessage(message.message) as pm }
    { #if pm.kind === MessageElementKind.LINK }
      <span>
        <!-- TODO: show object title as link and support opening of object details -->
        <a href={'#'}>{ pm.text }</a>
      </span>
    { :else }
      <span>{ pm.text }</span>
    { /if }
  { /each }
</div>
