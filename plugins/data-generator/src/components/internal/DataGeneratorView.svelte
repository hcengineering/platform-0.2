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
  import type { DateProperty, DocumentValue, Ref, StringProperty } from '@anticrm/core'
  import type { Application, Space, VDoc } from '@anticrm/domains'
  import { CORE_CLASS_SPACE, CORE_MIXIN_SHORTID } from '@anticrm/domains'
  import { QueryUpdater } from '@anticrm/platform-core'
  import fsmPlugin, { getFSMService, State, WithFSM } from '@anticrm/fsm'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import ComboBox from '@anticrm/platform-ui/src/components/ComboBox.svelte'
  import task, { Task } from '@anticrm/task'
  import type { Action } from '@anticrm/platform-ui'

  import faker from 'faker'

  let taskCount = 50
  let taskSpace: Space | undefined
  let spaces: Space[] = []

  let spacesQ: Promise<QueryUpdater<Space>> | undefined

  $: spacesQ = liveQuery<Space>(
    spacesQ,
    CORE_CLASS_SPACE,
    {
      application: task.application.Task
    },
    (docs) => {
      spaces = docs
    }
  )

  function filterSpaces (spaces: Space[], app: Ref<Application>): Space[] {
    return spaces.filter((sp) => sp.application === app)
  }

  function getActions (spaces: Space[], app: Ref<Application>): Action[] {
    return filterSpaces(spaces, app).map((sp) => {
      return {
        id: sp._id,
        name: sp.name,
        action: () => {
          taskSpace = sp
        }
      } as Action
    })
  }

  const coreService = getCoreService()
  const fsmService = getFSMService()

  async function generateTasks () {
    if (!taskSpace) {
      return
    }

    const cs = await coreService
    for (let i = 0; i < taskCount; i++) {
      const modelDb = cs.getModel()
      const newTask = modelDb.createDocument<Task>(task.class.Task, {
        title: (faker as any).commerce.productName() as StringProperty,
        _space: taskSpace._id as Ref<Space>,
        _createdOn: Date.now() as DateProperty,
        _createdBy: cs.getUserId() as StringProperty,
        comments: [
          {
            message: (faker as any).commerce.productDescription() as string,
            _createdOn: Date.now() as DateProperty,
            _createdBy: cs.getUserId() as StringProperty
          }
        ]
      } as DocumentValue<Task>)

      try {
        const asShortId = modelDb.cast(newTask, CORE_MIXIN_SHORTID)
        asShortId.shortId = await cs.genRefId(taskSpace._id as Ref<Space>)
      } catch (e) {
        // Ignore
        console.log(e)
      }

      const doc = await cs.create(task.class.Task, newTask)
      const projectWithFSM = modelDb.as(taskSpace, fsmPlugin.mixin.WithFSM)
      const fsm = await fsmService
      const states = (await fsm.getStates(projectWithFSM.fsm)).map((x) => x._id as Ref<State>)

      fsm.addStateItem(projectWithFSM, {
        _class: task.class.TaskFSMItem,
        obj: {
          clazz: task.class.Task,
          item: doc._id as Ref<VDoc>,
          state: states[Math.floor(Math.random() * states.length)]
        }
      })
    }
  }

  async function removeTasks () {
    if (!taskSpace) {
      return
    }

    const cs = await coreService
    const modelDb = cs.getModel()
    const projectWithFSM = modelDb.as(taskSpace, fsmPlugin.mixin.WithFSM)

    const fsmItems = await cs.find(task.class.TaskFSMItem, { fsm: projectWithFSM._id as Ref<WithFSM> })
    const taskItems = await cs.find(task.class.Task, { _space: taskSpace._id as Ref<Space> })

    await Promise.all(fsmItems.map(cs.remove.bind(cs)))
    await Promise.all(taskItems.map(cs.remove.bind(cs)))
  }

  $: if (!taskSpace && spaces.length > 0) {
    taskSpace = spaces[0]
  }
</script>

<div class="activity">
  <div class="captionContainer">
    <span class="caption-1">Data Generator</span>&nbsp;
  </div>
  <ScrollView height="100%" margin="2em" autoscroll={true}>
    <div class="content">
      Task Generator:
      <div class="actions">
        <div style="width: 300px">
          <ComboBox label="Space" items={getActions(spaces, task.application.Task)}>
            <div slot="title">
              {#if taskSpace}
                {taskSpace.name}
              {/if}
            </div>
          </ComboBox>
        </div>
        <EditBox id="create_task__input__name" bind:value={taskCount} label="Name" placeholder="Name" />

        <div>
          <Button width="100px" on:click={() => generateTasks()}>Generate Tasks</Button>
          <Button width="100px" on:click={() => removeTasks()}>Remove All Tasks</Button>
        </div>
      </div>
    </div>
  </ScrollView>
</div>

<style lang="scss">
  .activity {
    height: 100%;
    // background-color: red;
    display: flex;
    flex-direction: column;

    .content {
      flex-grow: 1;
    }

    .actions {
      display: flex;
      flex-direction: row;
    }

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--theme-bg-accent-color);
    }
  }
</style>
