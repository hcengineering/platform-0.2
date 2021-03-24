<script lang="ts">
  import {format, isToday} from "date-fns";
  import type {Habit} from "./Habit";

  export let day: Date;
  export let habits: Habit[];
  export let enabled: boolean;

  const key = day.toDateString();

  $: today = isToday(day);
  $: localHabits = habits;
  $: completedHabits = (JSON.parse(localStorage.getItem(key)) ?? []) as Habit[];

  const sameHabits = (habit1: Habit, habit2: Habit) =>
    JSON.stringify(habit1) === JSON.stringify(habit2);

  const isHabitCompleted = (habit: Habit) =>
    completedHabits.some((ch) => sameHabits(ch, habit));

  const toggleHabit = (habit: Habit) => {
    if (isHabitCompleted(habit)) {
      completedHabits = completedHabits.filter((ch) => !sameHabits(ch, habit));
      if (completedHabits.length > 0)
        localStorage.setItem(key, JSON.stringify(completedHabits));
      else localStorage.removeItem(key);
    } else {
      completedHabits = completedHabits.concat([habit]);
      localStorage.setItem(key, JSON.stringify(completedHabits));
    }
    localHabits = habits;
  };

</script>


{#if enabled}
<!--  <main>-->
    <div class="day">{format(day, 'EEE. do')}
      {#each localHabits as habit}
        <div class={`${isHabitCompleted(habit) ? 'toggle-habit' : ''}`}
             on:click={() => toggleHabit(habit)}>{habit.name}</div>
      {/each}
    </div>
<!--  </main>-->
{:else}
<!--  <main/>-->
{/if}

<style>
    div.day {
        width: 100%;
        border: 1px solid black;
        margin: 2px;
        padding: 5px;
        border-radius: 10px;
    }

    div.day:hover {
        background-color: gold;
        color: black;
    }

    div.toggle-habit {
        text-decoration: line-through;
    }
</style>




