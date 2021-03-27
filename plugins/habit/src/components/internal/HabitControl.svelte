<script lang="ts">
  import { format, isSameMonth } from 'date-fns'
  import { send, state } from '../../HabitMachine'
  // import Day from './Day.svelte'
  // import AddHabit from './AddHabit.svelte'
  // import { Habit } from '../../Habit'

  export let objects: any
  export let attributes: any
  export let dispatch: any

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
    }
  })
</script>

<main>
  <h2>{format(currentDate, 'MMMM - yyyy')}</h2>
  <div>
    <button on:click={() => send({type: 'NAVIGATE', direction: 'BACK'})}>Back</button>
    <button on:click={() => send({type: 'NAVIGATE', direction: 'HOME'})}>Home</button>
    <button on:click={() => send({type: 'NAVIGATE', direction: 'FORWARD'})}>Forward</button>
  </div>

</main>
<div class="grid auto-fit">
  {#each currentMonth as day (day.toDateString())}
    <main>
      <div class="day"><b>{format(day, 'EEE. do')}</b>
        {#each objects as object (object._id)}
          <div class="tr" on:click={() => dispatch('open', { _id: object._id, _class: object._class })}>
            {#each attributes as attr (attr.key)}
              {#if attr.label === 'Name'}
                <div>{object[attr.key] || ''}</div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </main>
  {/each}
</div>

<style>
    main {
        text-align: center;
        padding: 1em;
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

    div.day {
        width: 100%;
        border: 1px solid black;
        margin: 2px;
        padding: 5px;
        border-radius: 10px;
        background-color: #ffebcd;
        color: black;
    }

    div.day:hover {
        background-color: #999999;
        color: black;
    }

    div.toggle-habit {
        text-decoration: line-through;
    }
</style>
