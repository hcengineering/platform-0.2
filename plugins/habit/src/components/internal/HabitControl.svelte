<script lang="ts">
  import {format, isSameMonth} from "date-fns";
  import {send, state} from "../../HabitMachine";
  import Day from "./Day.svelte";
  import AddHabit from "./AddHabit.svelte";

  $: currentDate = $state.context.currentDate;
  $: currentMonth = $state.context.currentMonth;
  $: habits = $state.context.habits;

  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
        send({type: 'NAVIGATE', direction: 'BACK'});
        break;
      case 'ArrowRight':
        send({type: 'NAVIGATE', direction: 'FORWARD'});
        break;
      case 'Home':
        send({type: 'NAVIGATE', direction: 'HOME'});
        break;
      case 'Space':
        send('EDIT');
        break;
      case 'Escape':
        send('CANCEL_EDIT');
        break;
    }
  });
</script>

<main>
  <h2>{format(currentDate, 'MMMM - yyyy')}</h2>
<!--  <div>-->
<!--    <button on:click={() => send('EDIT')}>Add habit</button>-->
<!--    <button on:click={() => send('RESET')}>RESET</button>-->
<!--    {#if $state.matches('edit')}-->
<!--      <AddHabit />-->
<!--    {/if}-->
<!--  </div>-->
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
    <Day {day} {habits} enabled={isSameMonth(day, currentDate)}/>
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
</style>
