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
  import type { ObjectTx, SpaceUser, UpdateTx } from '@anticrm/domains'
  import { CORE_CLASS_CREATE_TX, CORE_CLASS_UPDATE_TX, TxOperationKind } from '@anticrm/domains'
  import type { Tx } from '@anticrm/core'
  import { getTransactionObjectDetails } from '../../details'

  export let tx: Tx

  function spaceName () {
    const value = getTransactionObjectDetails(tx as ObjectTx)
    if (value) {
      return value
    }
    return (tx as ObjectTx)._objectId
  }

  function getSpaceOperationDetails (tx: UpdateTx): string {
    for (const op of tx.operations) {
      if (op.kind === TxOperationKind.Push && op.selector?.length === 1 && op.selector[0].key === 'users') {
        return `User ${(op._attributes as SpaceUser).userId} is Joined Space ${spaceName()}`
      } else if (op.kind === TxOperationKind.Pull && op.selector?.length === 1 && op.selector[0].key === 'users') {
        return `User ${(op.selector[0].pattern as SpaceUser).userId} is Leave Space ${spaceName()}`
      }
    }
    return ''
  }
</script>

{#if tx._class === CORE_CLASS_CREATE_TX}Create space <b>{spaceName()}</b>
{:else if tx._class === CORE_CLASS_UPDATE_TX}
  {getSpaceOperationDetails(tx)}
{/if}
