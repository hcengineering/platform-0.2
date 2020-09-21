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

<script type="ts">
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'

  function createMessage(value: string) {
    console.log('user entered:', value)
  }
</script>

<div class="chat">
  <div>
    <span class="caption-1">Чат</span>&nbsp;
  </div>
  <ScrollView stylez="height:100%;">
    <div class="content">
      <!-- TODO: show messages -->
    </div>
  </ScrollView>
  <div>
    <ReferenceInput on:message={e => createMessage(e.detail)}/>
  </div>
</div>

<style lang="scss">
  .chat {
    height: 100%;
    display: flex;
    flex-direction: column;  
  }
  .content {
     flex-grow: 1;
  }
</style>
