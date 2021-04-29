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
  import { DateProperty, Doc, generateId, Ref, StringProperty } from '@anticrm/core'
  import type { Space } from '@anticrm/domains'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'

  import type { FSM, Transition, State } from '..'
  import fsmPlugin, { getFSMService } from '..'

  export let fsm: FSM
  export let transitions: Array<Transition> = []
  export let states: Map<Ref<Doc>, State> = new Map()

  let exisitingTransitions: Array<Transition> = []

  let transitionsMap: { [key: string]: Array<Transition> } = {}
  let statesArray: Array<State> = []

  $: transitionsMap = groupBy(transitions, (x) => x.from)
  $: statesArray = [...states.values()]

  async function init () {
    const fsmService = await getFSMService()

    exisitingTransitions = await fsmService.getTransitions(fsm)
    transitions = exisitingTransitions
    states = await fsmService.getStates(fsm).then((xs) => new Map(xs.map((x) => [x._id, x])))
  }

  const vProps = {
    _createdBy: '' as StringProperty,
    _createdOn: 0 as DateProperty,
    _space: '' as Ref<Space>
  }

  const onAddState = () => {
    const id = generateId()

    states.set(id, {
      _id: id,
      _class: fsmPlugin.class.State,
      ...vProps,
      name: '',
      fsm: fsm._id as Ref<FSM>
    })
    states = states
  }

  const onRemoveState = (id: Ref<Doc>) => {
    transitions = transitions.filter(({ from, to }) => [from, to].every((x) => x !== id))
    states.delete(id)
    states = states
  }

  const onToggleTransition = (from: Ref<Doc>, to: Ref<Doc>) => {
    const isEq = ({ from: _from, to: _to }: Transition) => from === _from && to === _to
    const idx = transitions.findIndex(isEq)

    if (idx < 0) {
      transitions.push(
        exisitingTransitions.find(isEq) ?? {
          _id: generateId(),
          _class: fsmPlugin.class.Transition,
          ...vProps,
          from: from as Ref<State>,
          to: to as Ref<State>,
          fsm: fsm._id as Ref<FSM>
        }
      )
    } else {
      transitions.splice(idx, 1)
    }

    transitions = transitions
  }
</script>

{#await init() then _}
  <div class="root">
    {#each statesArray as state (state._id)}
      <div class="state">
        <div class="state-header">
          <div class="state-name">
            <EditBox bind:value={state.name} label="State name" />
          </div>
          <Button label="Remove" on:click={() => onRemoveState(state._id)} />
        </div>
        <div class="state-transitions">
          {#each statesArray.filter((x) => x._id !== state._id) as tstate}
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
