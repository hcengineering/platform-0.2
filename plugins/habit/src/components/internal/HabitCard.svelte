<script lang="ts">
  import { spring } from 'svelte/motion'
  import { pannable } from './pannable'
  import { createEventDispatcher } from 'svelte'

  export let idCard: Number
  export let avatar: string = ''
  export let caption: string = ''
  export let desc: string = ''
  export let ghost: Boolean = false
  export let dublicate: Boolean = false
  export let topGhost: Number = 0

  let divHabit: HTMLElement
  let drag: Boolean = false

  const dispatch = createEventDispatcher()

	const coords = spring({ x: 0, y: 0 }, {
		stiffness: 0.2,
		damping: 0.4
	})

	function handlePanStart() {
		coords.stiffness = coords.damping = 1
    divHabit.style.zIndex = '+1'
    drag = true
    dispatch('drag', { id: idCard, value: true, top: divHabit.offsetTop })
	}

	function handlePanMove(event: MouseEvent) {
		coords.update($coords => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}))
    dispatch('move', { id: idCard, value: true, coords: $coords, event: event })
	}

	function handlePanEnd(event: MouseEvent) {
		coords.stiffness = 0.2
		coords.damping = 0.4
		coords.set({ x: 0, y: 0 })
    divHabit.style.zIndex = '0'
    drag = false
    dispatch('drag', { id: idCard, value: false, top: divHabit.offsetTop })
    dispatch('move', { id: idCard, value: false, coords: $coords, event: event })
	}
</script>

{#if ghost || dublicate}
<div class="card-view" class:ghost={ghost} class:dublicate={dublicate}
	style="transform:
		translate(0px,{topGhost}px)"
>
  <div class="card-head">
    <img class="card-head__avatar" src="{avatar}" alt="">
    <div class="card-head__caption">{caption}</div>
  </div>
  <div class="card-body">{desc}</div>
</div>

{:else}

<div bind:this={divHabit} class="card-view" class:drag={drag}
  use:pannable
	on:panstart={handlePanStart}
	on:panmove={handlePanMove}
	on:panend={handlePanEnd}
	style="transform:
		translate({$coords.x}px,{$coords.y}px)
		rotate({$coords.x * 0.03}deg)"
>
  <div class="card-head">
    <img class="card-head__avatar" src="{avatar}" alt="">
    <div class="card-head__caption">{caption}</div>
  </div>
  <div class="card-body">{desc}</div>
</div>
{/if}

<style lang="scss">
  .card-view {
    max-width: 300px;
    padding: 12px;
    background-color: var(--theme-bg-color);
    border: 1px solid var(--theme-bg-color);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    transition: border-color .3s ease-in, box-shadow .3s ease-in;

    .card-head {
      display: flex;
      flex-direction: row;
      align-items: center;

      &__avatar {
        width: 32px;
        height: 32px;
        border-radius: 16px;
      }
      &__caption {
        padding-left: 8px;
        color: var(--theme-doclink-color);
      }
    }
    .card-body {
      margin-top: 8px;
    }
  }
  .drag {
    border-color: var(--theme-bg-dark-color);
    box-shadow: var(--theme-shadow);
  }
  .ghost {
    position: absolute;
    opacity: .5;
  }
  .dublicate {
    border-color: var(--theme-bg-dark-color);
    opacity: .5;
  }
</style>
