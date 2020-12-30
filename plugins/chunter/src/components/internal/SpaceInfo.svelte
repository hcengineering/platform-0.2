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
  import { CreateTx, Space } from '@anticrm/core'
  import core from '@anticrm/core'
  import { Tx } from '@anticrm/model'

  export let tx: Tx

  function spaceName() {
    return (((tx as CreateTx).object as unknown) as Space).name
  }
</script>

{#if tx._class === core.class.CreateTx}Создал пространство <b>{spaceName()}</b>{/if}
