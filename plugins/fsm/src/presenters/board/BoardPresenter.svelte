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
  import { mixinKey, Ref } from '@anticrm/core'
  import { VDoc } from '@anticrm/domains'
  import { CoreService, QueryUpdater } from '@anticrm/platform-core'
  import { getUIService } from '@anticrm/platform-ui'
  import workbench from '@anticrm/workbench'
  import { getCoreService, liveQuery } from '@anticrm/presentation'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import EditModal from './EditModal.svelte'
  import Card from './Card.svelte'
  import type { CardDragEvent } from './cardHelper'

  import type { FSM, State, WithFSM } from '../..'
  import fsmPlugin from '../..'

  export let target: WithFSM

  let cs: CoreService | undefined
  const uiService = getUIService()

  async function init () {
    cs = await getCoreService()
  }

  let dragIn: any | null = null

  interface Status {
    id: any
    label: string
    defValue: boolean
    divTasks: any
  }

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

  let items: VDoc[] = []
  let itemsQuery: Promise<QueryUpdater<VDoc>> | undefined

  $: if (fsm && cs) {
    itemsQuery = liveQuery(
      itemsQuery,
      fsm.classes[0],
      {
        _mixins: fsmPlugin.mixin.WithState
      },
      (docs) => {
        const model = cs!.getModel()

        items = docs.filter((x) => model.as(x, fsmPlugin.mixin.WithState).fsm === target._id)
      }
    )
  }

  let statuses: Status[] = []
  let hiddenStatuses = new Set<string>()
  let statesQuery: Promise<QueryUpdater<State>> | undefined

  $: if (fsm && cs) {
    statesQuery = liveQuery(
      statesQuery,
      fsmPlugin.class.State,
      {
        fsm: fsm._id as Ref<FSM>
      },
      (docs) => {
        statuses = docs
          .filter((x): x is State => !!x)
          .map(
            (state, idx) =>
              ({
                id: state._id,
                label: state.name,
                defValue: idx === 0,
                divTasks: HTMLDocument
              } as Status)
          )
      }
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
    hiddenStatuses.has(sid) ? hiddenStatuses.delete(sid) : hiddenStatuses.add(sid)

    hiddenStatuses = hiddenStatuses
  }

  function onDrag (value: CustomEvent<CardDragEvent<VDoc>>): void {
    if (!cs) {
      return
    }

    if (value.detail.doc) {
      dragDoc = value.detail.doc
    }

    if (value.detail.doc && !value.detail.dragged) {
      const docState = getState(value.detail.doc)

      if (dragIn != null && dragDoc && docState !== dragIn) {
        cs.updateWith(dragDoc, (b) =>
          b.set({
            [mixinKey(fsmPlugin.mixin.WithState, 'state')]: dragIn
          })
        )

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

{#await init() then _}
  <Button
    label="Edit"
    on:click={() => {
      uiService.showModal(EditModal, { fsm })
    }} />
  <div class="cards-view">
    {#each statuses as stat (stat.id)}
      <div class="cards-status" class:thin={hiddenStatuses.has(stat.id)}>
        {#if hiddenStatuses.has(stat.id)}
          <a
            href="/"
            class="resizer"
            on:click|preventDefault={() => {
              changeStat(stat.id)
            }}>
            <Icon icon={workbench.icon.Resize} button={true} />
          </a>
        {/if}
        <div class="status__label" class:sl-mini={hiddenStatuses.has(stat.id)}>
          <button
            class="status__button"
            class:rotated={hiddenStatuses.has(stat.id)}
            style="background-color: black"
            on:click={() => {
              changeStat(stat.id)
            }}>{stat.label}</button>
        </div>

        <div bind:this={stat.divTasks} class="status__tasks" class:hidden={hiddenStatuses.has(stat.id)}>
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
