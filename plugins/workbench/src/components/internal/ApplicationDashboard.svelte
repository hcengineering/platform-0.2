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
  import workbench, { WorkbenchApplication } from '../..'
  import EditBox from '@anticrm/platform-ui/src/components/EditBox.svelte'
  import { format, isSameMonth } from 'date-fns'
  import { send, state } from './HabitMachine'
  import Day from './Day.svelte'
  import AddHabit from './AddHabit.svelte'

  $: currentDate = $state.context.currentDate
  $: currentMonth = $state.context.currentMonth
  $: habits = $state.context.habits

  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
        send({ type: 'NAVIGATE', direction: 'BACK' })
        break
      case 'ArrowRight':
        send({ type: 'NAVIGATE', direction: 'FORWARD' })
        break
      case 'Home':
        send({ type: 'NAVIGATE', direction: 'HOME' })
        break
      case 'Space':
        send('EDIT')
        break
      case 'Escape':
        send('CANCEL_EDIT')
        break
    }
  })

  export let application: WorkbenchApplication

  let addIcon: HTMLElement
</script>

<div class="workbench-browse">
  {#if application}
    <div class="captionContainer">
      <span class="caption-1" style="padding-right:1em">{application.label}</span>&nbsp;
      <div style="flex-grow:1"></div>
      <EditBox icon={workbench.icon.Finder} placeholder="Поиск по {application.label}..." iconRight="true" />
    </div>
  {/if}
  {#if application.label === 'Tasks'}
    <main>
      <h1><b>Habit control</b></h1>
      <h2>{format(currentDate, 'MMMM - yyyy')}</h2>
      <div style="margin: 2px">
        <button on:click={() => send('EDIT')}>Add habit</button>
        <button on:click={() => send('RESET')}>RESET</button>
      </div>
      {#if $state.matches('edit')}
        <AddHabit />
      {/if}
      <div>
        <button on:click={() => send({type: 'NAVIGATE', direction: 'BACK'})}>Back</button>
        <button on:click={() => send({type: 'NAVIGATE', direction: 'HOME'})}>Home</button>
        <button on:click={() => send({type: 'NAVIGATE', direction: 'FORWARD'})}>Forward</button>
      </div>
      <div>

      </div>
    </main>
    <div class="grid auto-fit">
      {#each currentMonth as day (day.toDateString())}
        <Day {day} {habits} enabled={isSameMonth(day, currentDate)} />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .workbench-browse {
    height: 100%;
    display: flex;
    flex-direction: column;

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .presentation {
      display: flex;
      flex-direction: row-reverse;
      margin-right: 1em;
    }

  }

  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    /*font-size: 4em;*/
    font-weight: 100;
  }

  .grid {
    display: grid;
    grid-gap: 2vw;
    margin: 5px;
  }

  .grid > div {
    font-size: 5vw;
    padding: .5em;
    background: gold;
    text-align: center;
  }

  .auto-fill {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .auto-fit {
    grid-template-columns: repeat(auto-fit, minmax(50px, 2fr));
  }
</style>
