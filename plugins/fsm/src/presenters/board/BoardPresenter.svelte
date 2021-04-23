<script type="ts">
  import type { Ref } from '@anticrm/core'
  import type { VDoc } from '@anticrm/domains'
  import { CoreService, QueryUpdater } from '@anticrm/platform-core'
  import workbench from '@anticrm/workbench'
  import { getCoreService, liveQuery } from '@anticrm/presentation'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import Card from './Card.svelte'
  import type { CardDragEvent } from './cardHelper'

  import { sortStates } from '../../utils'
  import type { FSM, State, WithFSM, WithState } from '../..'
  import fsmPlugin from '../..'

  export let target: WithFSM

  let cs: CoreService | undefined

  async function init () {
    cs = await getCoreService()
  }

  let dragIn: any | null = null

  interface Status {
    id: any
    label: string
    hidden: boolean
    defValue: boolean
    divTasks: any
  }

  let statuses: Array<Status> = []

  let items: VDoc[] = []
  let itemsQuery: Promise<QueryUpdater<WithState>> | undefined

  $: itemsQuery = liveQuery(
    itemsQuery,
    fsmPlugin.mixin.WithState,
    {
      fsm: target._id as Ref<WithFSM>
    },
    (docs) => {
      console.log('docs:', docs)
      items = docs.map((x) => (x as any).__layout)
    }
  )

  let fsm: FSM | undefined
  let fsmQuery: Promise<QueryUpdater<FSM>> | undefined

  $: fsmQuery = liveQuery(
    fsmQuery,
    fsmPlugin.class.FSM,
    {
      _id: target.fsm
    },
    (docs) => {
      fsm = docs[0]
    }
  )

  $: if (fsm) {
    Promise.all(sortStates(fsm).map((_id) => cs?.findOne(fsmPlugin.class.State, { _id }))).then((states) =>
      states
        .filter((x): x is State => !!x)
        .map(
          (state, idx) =>
            ({
              id: state._id,
              label: state.name,
              hidden: false,
              defValue: idx === 0,
              divTasks: HTMLDocument
            } as Status)
        )
    )
  }

  let dragDoc: VDoc | null = null

  function docsFor (vdocs: VDoc[], status: any): VDoc[] {
    if (!cs) {
      return []
    }

    const model = cs.getModel()

    const res = vdocs
      .filter((d) => {
        const itemWithState = model.as(d, fsmPlugin.mixin.WithState)

        return itemWithState.state === status
      })
      .sort((a, b) => {
        if (a._modifiedOn !== undefined && b._modifiedOn !== undefined) {
          return (b._modifiedOn as number) - (a._modifiedOn as number)
        }
        if (a._modifiedOn === undefined && b._modifiedOn === undefined) {
          return 0
        }
        if (a._modifiedOn === undefined) {
          return 1
        }
        return -1
      })
    return res
  }

  function changeStat (sid: any): void {
    statuses = statuses.map((s) => {
      if (s.id === sid) {
        s.hidden = !s.hidden
      }
      return s
    })
  }

  function onDrag (value: CustomEvent<CardDragEvent<VDoc>>): void {
    if (!cs) {
      return
    }

    if (value.detail.doc) {
      dragDoc = value.detail.doc
    }

    if (value.detail.doc && !value.detail.dragged) {
      const docState = getState(dragDoc)

      if (dragIn != null && dragDoc && docState !== dragIn) {
        const docWithState = cs.getModel().as(dragDoc, fsmPlugin.mixin.WithState)

        cs.update(docWithState, { state: docState })

        dragDoc = null
      }
      dragIn = null
    }
  }

  function onMove (value: unknown): void {
    const event = value.detail.event
    if (dragIn !== whereInStatus(event.detail.x)) {
      dragIn = whereInStatus(event.detail.x)
    }
  }

  function whereInStatus (coordX: number): any | null {
    for (const el of statuses) {
      const obj = el.divTasks.getBoundingClientRect()
      if (coordX >= obj.left && coordX <= obj.right) {
        return el.id
      }
    }
    return null
  }

  function getState (doc: VDoc): any {
    if (!cs) {
      return
    }

    return cs.getModel().as(doc, fsmPlugin.mixin.WithState).state
  }
</script>

{#await init()}
  <div />
{:then}
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
            <Icon icon={workbench.icon.Resize} button={true} />
          </a>
        {/if}
        <div class="status__label" class:sl-mini={stat.hidden}>
          <button
            class="status__button"
            class:rotated={stat.hidden}
            style="background-color: black"
            on:click={() => {
              changeStat(stat.id)
            }}>{stat.label}</button>
        </div>

        <div bind:this={stat.divTasks} class="status__tasks" class:hidden={stat.hidden}>
          {#if dragIn === stat.id && dragDoc && dragIn !== getState(dragDoc)}
            <Card doc={dragDoc} duplicate={true} />
            <div class="separator" />
          {/if}
          {#each docsFor(items, stat.id) as doc (doc._id)}
            <div class="separator" />
            <Card {doc} on:drag={onDrag} on:move={onMove} />
          {/each}
        </div>
      </div>
      <div class="status-separator" />
    {/each}
  </div>
{/await}

<style lang="scss">
  .cards-view {
    user-select: none;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;

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
        color: var(--theme-white-color);
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
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: auto;
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