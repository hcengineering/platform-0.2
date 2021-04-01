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

  import { NumberProperty, Property, Ref, StringProperty } from '@anticrm/core'
  import { Application, CORE_CLASS_SPACE, CORE_MIXIN_SHORTID, Space } from '@anticrm/domains'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { createLiveQuery, getCoreService } from '@anticrm/presentation'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import ComboBox from '@anticrm/platform-ui/src/components/ComboBox.svelte'
  import task, { TaskStatus } from '@anticrm/task'
  import chunter, { Comment } from '@anticrm/chunter'
  import { Action } from '@anticrm/platform-ui'

  import faker from 'faker'

  let taskCount = 50
  let taskSpace: Space | undefined
  let spaces: Space[] = []

  createLiveQuery(CORE_CLASS_SPACE, {}, (docs) => {
    spaces = docs
  })

  function filterSpaces (spaces: Space[], app: Ref<Application>): Space[] {
    return spaces.filter(sp => sp.application === app)
  }

  function getActions (spaces: Space[], app: Ref<Application>): Action[] {
    return filterSpaces(spaces, app).map(sp => {
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

  function randomEnum<T> (anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    return enumValues[randomIndex]
  }

  async function generateTasks () {
    if (!taskSpace) {
      return
    }
    const cs = await coreService
    for (let i = 0; i < taskCount; i++) {

      let modelDb = cs.getModel()
      const newTask = modelDb.newDoc(task.class.Task, cs.generateId(), {
        title: faker.commerce.productName() as StringProperty,
        _space: taskSpace._id,
        status: randomEnum(TaskStatus) as NumberProperty,
        comments: [{
          message: faker.commerce.productDescription(),
          _class: chunter.class.Comment,
          _createdOn: Date.now() as Property<number, Date>,
          _createdBy: cs.getUserId() as Property<string, string>
        } as Comment]
      })
      try {
        const asShortId = modelDb.cast(newTask, CORE_MIXIN_SHORTID)
        asShortId.shortId = await cs.genRefId(taskSpace._id as Ref<Space>)
      } catch (e) {
        // Ignore
        console.log(e)
      }
      console.log('NEW TASK', newTask)

      await cs.create(task.class.Task, newTask)
    }
  }

  async function removeTasks () {
    const cs = await coreService
    if (!taskSpace) {
      return
    }
    const tasks = await cs.find(task.class.Task, { _space: taskSpace._id })
    for (const t of tasks) {
      await cs.remove(t, null)
    }
  }

  $: {
    if (!taskSpace) {
      const sps = filterSpaces(spaces, task.application.Task)
      if (sps && sps.length > 0) {
        taskSpace = sps[0]
      }
    }
  }

</script>

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
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      align-items: center;
    }
  }
</style>

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
        <EditBox id="create_task__input__name" bind:value={taskCount}
                 label="Name" placeholder="Name" />

        <div>
          <Button width="100px" on:click={()=> generateTasks()}>Generate Tasks</Button>
          <Button width="100px" on:click={()=> removeTasks()}>Remove All Tasks</Button>
        </div>
      </div>
    </div>
  </ScrollView>
</div>
