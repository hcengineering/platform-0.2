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
  import { Tx } from '@anticrm/core'
  import { CORE_CLASS_CREATE_TX, CreateTx } from '@anticrm/domains'
  import { Habit } from '../..'

  export let tx: Tx

  function habitTitle () {
    return (((tx as CreateTx).object as unknown) as Habit).title
  }
</script>

{#if tx._class === CORE_CLASS_CREATE_TX}Создал задачу <b>{habitTitle()}</b>{/if}
