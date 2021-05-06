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
  import { Attribute } from '@anticrm/core'
  import { toTypeStr } from './utils'
  export let value: Attribute
</script>

<div class="chat-message-item">
  <div class="details">
    <b>{toTypeStr(value.type)}</b>
  </div>
</div>

<style lang="scss">
  .chat-message-item {
    display: flex;
    margin-bottom: 1em;
  }
</style>
