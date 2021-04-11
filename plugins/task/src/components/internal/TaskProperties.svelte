<script type="ts">
  import type { Enum, Model, NumberProperty } from '@anticrm/core'
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
  import { CORE_CLASS_ENUM } from '@anticrm/core'
  import type { Task } from '../..'
  import task, { TaskStatus } from '../..'
  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import StatusLabel from './StatusLabel.svelte'
  import ActionBar from '@anticrm/platform-ui/src/components/ActionBar.svelte'
  import type { Action } from '@anticrm/platform-ui'
  import Comments from '@anticrm/chunter/src/components/Comments.svelte'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import type { ShortID } from '@anticrm/domains'
  import { CORE_MIXIN_SHORTID } from '@anticrm/domains'
  import ux, { getCoreService } from '@anticrm/presentation'

  export let object: Task

  const coreService = getCoreService()
  let model: Model

  let statusType: Enum<TaskStatus> | undefined
  let status: TaskStatus = TaskStatus.Open

  const statusColors: Map<TaskStatus, string> = new Map()

  coreService.then(async (cs) => {
    model = cs.getModel()
    statusType = await cs.findOne(CORE_CLASS_ENUM, { _id: task.enum.TaskStatus })
  })

  let statusActions: Action[] = []
  let taskShortId: ShortID

  $: {
    if (statusType) {
      const acts: Action[] = []
      for (const s of Object.entries(statusType._literals)) {
        const statKey = parseInt(s[0]) as TaskStatus
        if (object && object.status === statKey) {
          status = statKey
        }
        if (object && object.status !== statKey) {
          const lit = model.as(s[1], ux.mixin.UXAttribute)
          statusColors.set(statKey, lit.color as string)
          const act = model.as(s[1], task.mixin.TaskStatusAction)
          if (act) {
            acts.push({
              name: act.action,
              action: () => {
                coreService.then((cs) => cs.update(object, null, { status: statKey as NumberProperty }))
              }
            })
          }
        }
      }
      statusActions = acts
      coreService.then((cs) => {
        taskShortId = cs.getModel().as(object, CORE_MIXIN_SHORTID)
      })
    }
  }
</script>

<div class="taskContent">
  <div class="caption caption-1">
    <InlineEdit
      id="create_task__input__name"
      bind:value={object.title}
      width="100%"
      label="Name"
      placeholder="Name"
      on:change={async () => {
        (await coreService).update(object, null, { title: object.title })
      }} />
  </div>
  <div class="taskStatusBar">
    <div class="taskName">
      {#if taskShortId}
        {taskShortId.shortId}
      {/if}
    </div>
    <StatusLabel text={TaskStatus[status]} color={statusColors.get(status)} />
  </div>
  <div class="created">
    <UserInfo url="https://platform.exhale24.ru/images/photo-1.png" title="Александр Алексеенко" />
    <div class="createdOn">30.11.20, 15:30</div>
  </div>
  <UserInfo url="https://platform.exhale24.ru/images/photo-2.png" title="Андрей Платов" subtitle="Исполнитель" />

  {#if statusActions.length > 0}
    <ActionBar onTop="2" actions={statusActions} />
  {/if}

  <div class="description">
    <Comments {object} />
    <ul class="files">
      <li><a href="/">interfaceRpcErrors.docx</a></li>
      <li><a href="/">interfaceRpcErrors..docx</a></li>
    </ul>
  </div>
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .taskContent {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .caption {
      max-width: 18em;
      margin-bottom: 0.5em;
    }

    .taskStatusBar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1em;

      .taskName {
        font-size: 14px;
        color: $theme-status-blue-color;
      }
    }

    .created {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1em;

      .createdOn {
        font-size: 11px;
        font-weight: 500;
      }
    }

    .description {
      overflow-y: auto;

      .files {
        list-style-type: none;
        margin: 0;
        padding: 0;
        margin-bottom: 1em;

        & > li {
          margin-bottom: 0.2em;
          margin-left: 2em;
          margin-top: 5px;
          position: relative;

          &::before {
            position: absolute;
            content: '';
            background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.57422 12.3535L11.2917 5.636C13.2444 3.68338 16.4102 3.68338 18.3628 5.636V5.636C20.3154 7.58862 20.3154 10.7544 18.3628 12.7071L13.4131 17.6568' stroke='%23505050' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M4.57448 12.3533C3.20765 13.7201 3.20765 15.9362 4.57448 17.303C5.94132 18.6698 8.1574 18.6698 9.52423 17.303L14.1204 12.7068' stroke='%23505050' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14.1197 12.707C14.9008 11.926 14.9008 10.6597 14.1197 9.8786C13.3387 9.09756 12.0724 9.09756 11.2913 9.8786L8.46289 12.707' stroke='%23505050' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
            background-repeat: no-repeat;
            left: -2em;
            top: -0.25em;
            width: 24px;
            height: 24px;
          }
        }
      }
    }
  }
  :global(.theme-dark) .taskContent .created .createdOn {
    color: $theme-dark-content-trans-color;
  }
  :global(.theme-grey) .taskContent .created .createdOn {
    color: $theme-grey-content-trans-color;
  }
  :global(.theme-light) .taskContent .created .createdOn {
    color: $theme-light-content-trans-color;
  }
</style>
