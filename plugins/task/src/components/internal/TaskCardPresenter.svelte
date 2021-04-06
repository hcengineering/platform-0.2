<script type="ts">
  import type { Enum } from '@anticrm/core'
  import { CORE_CLASS_ENUM } from '@anticrm/core'
  import TaskCard from './TaskCard.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '@anticrm/workbench'
  import { TaskStatus } from '../..'
  import task from '@anticrm/task'
  import type { UXAttribute } from '@anticrm/presentation'
  import ui, { getCoreService } from '@anticrm/presentation'

  // export let _class: Ref<Class<Doc>>
  // export let space: Ref<Space>
  const coreService = getCoreService()

  let topGhost = ''
  let dragId = -1
  let dragIn = -1

  interface StatUses {
    id: number
    label: string
    color: string
    hidden: boolean
    divTasks: any
  }

  let statuses: Array<StatUses> = []
  // Load and subscribe to any task status values.
  coreService.then((cs) => {
    cs.findOne<Enum<TaskStatus>>(CORE_CLASS_ENUM, { _id: task.enum.TaskStatus }).then((taskStatus) => {
      if (taskStatus) {
        const newSt: StatUses[] = []
        for (const st of Object.entries(taskStatus._literals)) {
          const lit = cs.getModel().as<UXAttribute>(st[1], ui.mixin.UXAttribute)
          newSt.push({
            id: st[0] as number,
            label: lit.label,
            color: lit.color as string,
            hidden: false,
            divTasks: HTMLElement
          })
        }
        statuses = newSt
      }
    })
  })

  const tasks: Array<any> = [
    {
      id: 0,
      avatar: 'https://platform.exhale24.ru/images/photo-1.png',
      task_id: 'ER-925',
      desc: 'Сделать дизайн удаления заявления со страницы...',
      status: 0,
      drag: false
    },
    {
      id: 1,
      avatar: 'https://platform.exhale24.ru/images/photo-2.png',
      task_id: 'DT-148',
      desc: 'Дизайн доработок для сделок с комиссией риелтора',
      status: 0,
      drag: false
    },
    {
      id: 2,
      avatar: 'https://platform.exhale24.ru/images/photo-3.png',
      task_id: 'LK-1230',
      desc: 'Лендинг-пейдж для сервиса Screenversation',
      status: 1,
      drag: false
    },
    {
      id: 3,
      avatar: 'https://platform.exhale24.ru/images/photo-1.png',
      task_id: 'LK-1298',
      desc: 'Страница «Наши партнёры»',
      status: 2,
      drag: false
    },
    {
      id: 4,
      avatar: 'https://platform.exhale24.ru/images/photo-3.png',
      task_id: 'DT-140',
      desc: 'Дизайн Конструктора в личном кабинете',
      status: 3,
      drag: false
    },
    {
      id: 5,
      avatar: 'https://platform.exhale24.ru/images/photo-4.png',
      task_id: 'ER-930',
      desc: 'Задачи в виде канбан-доски в AntiCRM...',
      status: 0,
      drag: false
    }
  ]

  function changeStat (sid: number): void {
    statuses[sid].hidden = !statuses[sid].hidden
  }

  function onDrag (value: unknown): void {
    tasks[value.detail.id].drag = value.detail.value
    topGhost = value.detail.top
    if (value.detail.value) {
      dragId = value.detail.id
    } else {
      if (tasks[dragId].status !== dragIn && dragIn !== -1) tasks[dragId].status = dragIn
      dragIn = -1
    }
  }

  function onMove (value: unknown): void {
    const event = value.detail.event
    if (dragIn !== whereInStatus(event.detail.x)) {
      dragIn = whereInStatus(event.detail.x)
    }
  }

  function whereInStatus (coordX: number): number {
    let resault = -1
    statuses.forEach((el) => {
      const obj = el.divTasks.getBoundingClientRect()
      if (coordX >= obj.left && coordX <= obj.right) resault = el.id
    })
    return resault
  }
</script>

<div class="cards-view">
  {#each statuses as stat (stat.id)}
    <div class="cards-status" class:thin={stat.hidden}>
      {#if stat.hidden}
        <a
          href="/"
          class="resizer"
          on:click|preventDefault={() => {
            changeStat(stat.id)
          }}>
          <Icon icon={workbench.icon.Resize} button="true" />
        </a>
      {/if}
      <div class="status__label" class:sl-mini={stat.hidden}>
        <button
          class="status__button"
          class:rotated={stat.hidden}
          style="background-color: {stat.color}"
          on:click={() => {
            changeStat(stat.id)
          }}>{stat.label}</button>
      </div>
      <div bind:this={stat.divTasks} class="status__tasks" class:hidden={stat.hidden}>
        {#each tasks.filter((t) => t.status === stat.id) as task (task.id)}
          <div class="separator" />
          <TaskCard
            idCard={task.id}
            avatar={task.avatar}
            caption={task.task_id}
            desc={task.desc}
            on:drag={onDrag}
            on:move={onMove} />
          {#if task.drag}
            <TaskCard
              idCard={task.id}
              avatar={task.avatar}
              caption={task.task_id}
              desc={task.desc}
              ghost="true"
              {topGhost} />
          {/if}
        {/each}
        {#if dragIn === stat.id && dragIn !== tasks[dragId].status}
          <div class="separator" />
          <TaskCard
            idCard={tasks[dragId].id}
            avatar={tasks[dragId].avatar}
            caption={tasks[dragId].task_id}
            desc={tasks[dragId].desc}
            dublicate="true" />
        {/if}
      </div>
    </div>
    <div class="status-separator" />
  {/each}
</div>

<style lang="scss">
  .cards-view {
    user-select: none;
    display: flex;
    flex-direction: row;
    width: 100%;

    .cards-status {
      display: flex;
      flex-direction: column;
      position: relative;
      flex-basis: 250px;

      .status__label {
        display: flex;
        max-width: 250px;
        width: 100%;
        height: 24px;
        justify-content: center;
        align-items: center;
      }

      .status__button {
        display: flex;
        width: 100%;
        height: 24px;
        font-weight: 500;
        font-size: 11px;
        border: none;
        border-radius: 4px;
        justify-content: center;
        align-items: center;
        color: var(--white-color);
        outline: none;
        cursor: pointer;
      }

      .rotated {
        width: 120px;
        max-width: 120px;
        min-width: 120px;
        transform: rotate(-90deg) translate(calc(-50% + 12px), 0px);
      }

      .status__tasks {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .separator {
        height: 12px;
      }
    }

    .thin {
      width: 24px;
      max-width: 24px;
    }
  }

  .hidden {
    visibility: hidden;
  }

  .sl-mini {
    width: 24px;
  }

  .status-separator {
    min-width: 16px;

    &:last-child {
      min-width: 0px;
    }
  }

  .resizer {
    position: absolute;
    top: 132px;
    left: 3px;
  }
</style>
