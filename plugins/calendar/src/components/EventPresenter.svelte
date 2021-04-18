<!--
// Copyright © 2021 Anticrm Platform Contributors.
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
  import type { EventCoordinates } from './EventCoordinates'
  import type { CalendarEvent } from '..'

  export let event: CalendarEvent
  export let coordinates: EventCoordinates | undefined
  let eventIntervals: EventCoordinates[] = []
  let rowIndex = 0

  $: {
    if (!coordinates || coordinates.gridRowStart === coordinates.gridColumnEnd) {
      eventIntervals = coordinates ? [coordinates] : []
    } else {
      eventIntervals = []
      eventIntervals.push({
        ...coordinates,
        gridRowEnd: coordinates.gridRowStart,
        gridColumnEnd: 8
      } as EventCoordinates)
      eventIntervals.push({
        ...coordinates,
        gridRowStart: coordinates.gridRowEnd,
        gridColumnStart: 1
      } as EventCoordinates)
      for (rowIndex = coordinates.gridRowStart + 1; rowIndex < coordinates.gridRowEnd; rowIndex++) {
        eventIntervals.push({
          ...coordinates,
          gridRowStart: rowIndex,
          gridRowEnd: rowIndex,
          gridColumnStart: 1,
          gridColumnEnd: 8
        } as EventCoordinates)
      }
    }
  }
</script>

{#each eventIntervals as interval}
  <div
    style={`
    grid-column-start: ${interval.gridColumnStart}; 
    grid-column-end: ${interval.gridColumnEnd};
    grid-row-start: ${interval.gridRowStart};
    grid-row-end: ${interval.gridRowEnd};
    margin-top: ${21 * (interval.displayLayer || 1)}px;
    `}>
    <div class="event">
      <div class="event-item">{event.summary}</div>
      {#if event.participants && event.participants.length > 0}
        <div class="event-item">{event.participants[0]}</div>
      {/if}
    </div>
  </div>
{/each}

<style lang="scss">
  .event {
    height: 20px;
    width: 100%;
    background-color: #4396a2;
    text-align: center;
    border-radius: 3px;
    color: var(--theme-content-color);
    display: flex;
    justify-content: center;
  }
  .event-item {
    padding-right: 5px;
  }
</style>
