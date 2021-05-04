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
<script lang="ts">
  import groupBy from 'lodash/groupBy'

  import { DateProperty, Doc, Ref, StringProperty } from '@anticrm/core'
  import type { CoreService, QueryUpdater } from '@anticrm/platform-core'
  import type { Space } from '@anticrm/domains'
  import { getCoreService, liveQuery } from '@anticrm/presentation'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'

  import type { FSM, Transition, State, FSMItem } from '..'
  import fsmPlugin from '..'

  export let fsm: FSM

  let transitions: Array<Transition> = []
  let states: Array<State> = []

  let transitionsQ: Promise<QueryUpdater<Transition>> | undefined
  let statesQ: Promise<QueryUpdater<State>> | undefined

  $: transitionsQ = liveQuery(
    transitionsQ,
    fsmPlugin.class.Transition,
    {
      fsm: fsm._id as Ref<FSM>
    },
    (docs) => {
      transitions = docs
    }
  )

  $: statesQ = liveQuery(
    statesQ,
    fsmPlugin.class.State,
    {
      fsm: fsm._id as Ref<FSM>
    },
    (docs) => {
      states = docs
    }
  )

  let fsmItems: FSMItem[] = []
  let fsmItemsQ: Promise<QueryUpdater<FSMItem>> | undefined

  $: fsmItemsQ = liveQuery(
    fsmItemsQ,
    fsmPlugin.class.FSMItem,
    {
      fsm: fsm._id as Ref<FSM>
    },
    (docs) => {
      fsmItems = docs
    }
  )

  let transitionsMap: { [key: string]: Array<Transition> } = {}
  let usedStates = new Set<Ref<Doc>>()

  $: transitionsMap = groupBy(transitions, (x) => x.from)
  $: usedStates = new Set(
    transitions
      .map((x) => [x.from, x.to])
      .flat()
      .concat(fsmItems.map((x) => x.state))
  )

  let cs: CoreService
  const vProps = {
    _createdBy: '' as StringProperty,
    _space: fsmPlugin.space.Common as Ref<Space>
  }

  async function init () {
    cs = await getCoreService()
    vProps._createdBy = cs.getUserId() as StringProperty
  }

  const onAddState = () => {
    cs.create(fsmPlugin.class.State, {
      ...vProps,
      _createdOn: Date.now() as DateProperty,
      name: 'New state',
      fsm: fsm._id as Ref<FSM>
    })
  }

  const onRemoveState = (state: State) => {
    cs.remove(state)
  }

  const onToggleTransition = (from: Ref<Doc>, to: Ref<Doc>) => {
    const isEq = ({ from: _from, to: _to }: Transition) => from === _from && to === _to
    const transition = transitions.find(isEq)

    if (!transition) {
      cs.create(fsmPlugin.class.Transition, {
        ...vProps,
        _createdOn: Date.now() as DateProperty,
        fsm: fsm._id as Ref<FSM>,
        from: from as Ref<State>,
        to: to as Ref<State>
      })
    } else {
      cs.remove(transition)
    }
  }

  let renameStateID: Ref<Doc> | undefined
  let renameStateName: string = ''

  const onStateInputFocus = (id: Ref<Doc>, name: string) => {
    renameStateID = id
    renameStateName = name
  }

  const onStateNameInput = (e: any) => {
    if (e.key === 'Enter') {
      const state = states.find((x) => renameStateID === x._id)

      if (!state) {
        return
      }

      cs.update(state, {
        name: renameStateName
      })

      renameStateID = undefined
      renameStateName = ''
    }
  }
</script>

{#await init() then _}
  <div class="root">
    {#each states as state (state._id)}
      <div class="state">
        <div class="state-header">
          <div class="state-name">
            {#if state._id === renameStateID}
              <EditBox bind:value={renameStateName} on:keypress={onStateNameInput} label="State name" />
            {:else}
              <div class="readonly-name" on:click={() => onStateInputFocus(state._id, state.name)}>
                {state.name}
              </div>
            {/if}
          </div>
          {#if !usedStates.has(state._id)}
            <Button label="Remove" on:click={() => onRemoveState(state)} />
          {/if}
        </div>
        <div class="state-transitions">
          {#each states.filter((x) => x._id !== state._id) as tstate}
            <div class="state-transition">
              <CheckBox
                checked={transitionsMap[state._id] && transitionsMap[state._id].some((x) => x.to === tstate._id)}
                onToggle={() => onToggleTransition(state._id, tstate._id)} />
              {tstate.name}
            </div>
          {/each}
        </div>
      </div>
    {/each}
    <Button label="Add state" on:click={onAddState} />
  </div>
{/await}

<style lang="scss">
  .root {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }

  .state {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 15px;

    padding: 5px;
    border: 1px solid;
    border-radius: 5px;
    border-color: var(--theme-bg-accent-color);
  }

  .state-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .state-name {
    padding-right: 20px;
  }

  .readonly-name {
    font-weight: 500;

    cursor: pointer;
  }

  .state-transitions {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }

  .state-transition {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  }
</style>
