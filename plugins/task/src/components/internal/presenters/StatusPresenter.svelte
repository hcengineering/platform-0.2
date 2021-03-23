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
  import { Ref } from '@anticrm/core'
  import { AttrModel, createLiveQuery, updateLiveQuery } from '@anticrm/presentation'
  import task, { TaskFieldValue } from '../../../index'
  import StatusLabel from '../StatusLabel.svelte'

  export let value: Ref<TaskFieldValue>
  export let attribute: AttrModel
  export let maxWidth: number = 300
  export let editable: boolean

  let text: string = ''
  let color: string = ''

  const update = createLiveQuery(task.class.TaskFieldValue, { _id: value }, (docs) => {
    if (docs.length > 0) {
      text = docs[0].title
      color = docs[0].color
    }
  })

  $: updateLiveQuery( update, task.class.TaskFieldValue, { _id: value })
</script>

<StatusLabel {text} {color} />
