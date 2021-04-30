<!--
// Copyright © 2021 Anticrm Platform Contributors.
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
  import type { Enum, Model } from '@anticrm/core'
  import { CORE_CLASS_ENUM } from '@anticrm/core'
  import type { AttrModel, UXAttribute } from '@anticrm/presentation'
  import ux, { getCoreService } from '@anticrm/presentation'
  import task, { TaskStatus } from '../../../index'
  import StatusLabel from '../StatusLabel.svelte'

  export let value: TaskStatus = TaskStatus.Open
  export let attribute: AttrModel
  export let editable: boolean

  let text = ''
  let color = ''

  let statusType: Enum<TaskStatus> | undefined

  let model: Model

  getCoreService().then(async (cs) => {
    statusType = await cs.findOne<Enum<TaskStatus>>(CORE_CLASS_ENUM, { _id: task.enum.TaskStatus })
    model = cs.getModel()
  })
  // .then(()=>{console.log('MODEL',model)})
  
  $: if (statusType) {
    const status = statusType._literals[value]

    if (status && model.isMixedIn<UXAttribute>(status, ux.mixin.UXAttribute)) {
      const lit = model.as<UXAttribute>(status, ux.mixin.UXAttribute)
      text = status.label
      color = lit.color as string
    }
  }
</script>

{#if attribute && !editable}
  <StatusLabel {text} {color} />
{/if}
