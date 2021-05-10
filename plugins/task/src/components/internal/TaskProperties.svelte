<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script type="ts">
  import type { Ref } from '@anticrm/core'
  import type { ShortID, VDoc } from '@anticrm/domains'
  import { CORE_MIXIN_SHORTID } from '@anticrm/domains'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import { QueryUpdater } from '@anticrm/platform-core'
  import type { Action } from '@anticrm/platform-ui'
  import fsmPlugin, { State, WithFSM } from '@anticrm/fsm'

  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ActionBar from '@anticrm/platform-ui/src/components/ActionBar.svelte'
  import Comments from '@anticrm/chunter/src/components/Comments.svelte'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import StateLabel from '@anticrm/fsm/src/presenters/StateLabel.svelte'

  import type { Project, Task, TaskFSMItem } from '../..'
  import taskPlugin from '../..'

  export let object: TaskFSMItem

  const coreService = getCoreService()

  let fsmOwner: WithFSM
  let fsmOwnerQ: Promise<QueryUpdater<Project>> | undefined

  $: fsmOwnerQ = liveQuery(
    fsmOwnerQ,
    taskPlugin.class.Project,
    {
      _id: (object.fsm as never) as Ref<Project>
    },
    async (docs) => {
      const doc = docs[0]

      if (!doc) {
        return
      }

      const model = (await coreService).getModel()

      fsmOwner = model.as(doc, fsmPlugin.mixin.WithFSM)
    }
  )

  let task: Task | undefined
  let taskQ: Promise<QueryUpdater<VDoc>> | undefined

  $: taskQ = liveQuery(
    taskQ,
    object.clazz,
    {
      _id: object.item
    },
    async (docs) => {
      task = docs[0] as Task

      ;(await coreService).getModel().asMixin(object, CORE_MIXIN_SHORTID, (value) => {
        taskShortId = value
      })
    }
  )

  let states: State[] = []
  let statesQ: Promise<QueryUpdater<State>> | undefined

  $: if (fsmOwner) {
    statesQ = liveQuery(
      statesQ,
      fsmPlugin.class.State,
      {
        fsm: fsmOwner.fsm
      },
      (docs) => {
        states = docs
      }
    )
  }

  let statusActions: Action[] = []
  let taskShortId: ShortID
  let state: State | undefined

  $: state = states.find((x) => object.state === x._id)

  $: {
    statusActions = states.map((state) => ({
      id: state._id,
      name: state.name,
      action: () => {
        coreService.then((cs) => cs.update(object, { state: state._id as Ref<State> }))
      }
    }))

    coreService.then((cs) => {
      cs.getModel().asMixin(object, CORE_MIXIN_SHORTID, (value) => {
        taskShortId = value
      })
    })
  }
</script>

{#if task}
  <div class="taskContent">
    <div id="create_task__input__name" class="caption caption-1">
      <InlineEdit
        bind:value={task.title}
        placeholder="Name"
        on:change={async () => {
          if (task === undefined) {
            return
          }

          await (await coreService).update(task, { title: task.title })
        }} />
    </div>
    <div class="taskStatusBar">
      <div class="taskName">
        {#if taskShortId}
          {taskShortId.shortId}
        {/if}
      </div>
      {#if state}
        <StateLabel {state} />
      {/if}
    </div>
    <div class="created">
      <UserInfo url="https://platform.exhale24.ru/images/photo-1.png" title="Александр Алексеенко" />
      <div class="createdOn">30.11.20, 15:30</div>
    </div>
    <UserInfo url="https://platform.exhale24.ru/images/photo-2.png" title="Андрей Платов" subtitle="Исполнитель" />

    {#if statusActions.length > 0}
      <ActionBar onTop={2} actions={statusActions} />
    {/if}

    <div class="description">
      <Comments {object} />
      <ul class="files">
        <li><a href="/">interfaceRpcErrors.docx</a></li>
        <li><a href="/">interfaceRpcErrors..docx</a></li>
      </ul>
    </div>
  </div>
{/if}

<style lang="scss">
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
        color: var(--theme-status-blue-color);
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
        color: var(--theme-content-trans-color);
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
</style>
