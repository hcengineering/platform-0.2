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
  import type { ObjectTx } from '@anticrm/domains'
  import { CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_UPDATE_TX } from '@anticrm/domains'
  import type { Tx } from '@anticrm/core'
  import { getTransactionObjectDetails } from '../../details'

  export let tx: Tx

  function objClass () {
    const v = (tx as ObjectTx)._objectClass
    return v.substring(v.lastIndexOf('.') + 1)
  }

  function objName () {
    const value = getTransactionObjectDetails(tx as ObjectTx)
    if (value) {
      return value
    }
    return (tx as ObjectTx)._objectClass + ' ' + (tx as ObjectTx)._objectId
  }
</script>

{#if tx._class === CORE_CLASS_CREATE_TX}Create {objClass()} <b>{objName()}</b>
{:else if tx._class === CORE_CLASS_UPDATE_TX}
  Update {objClass()} {objName(tx)}
{:else if tx._class === CORE_CLASS_DELETE_TX}
  Delete {objClass()} {objName(tx)}
{/if}
