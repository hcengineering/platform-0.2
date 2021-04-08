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
  import type { Space } from '@anticrm/domains'
  import { liveQuery } from '@anticrm/presentation'

  import type { CalendarEvent } from '..'
  import calendar from '..'

  import MonthCalendar from '@anticrm/sparkling-controls/src/calendar/MonthCalendar.svelte'

  export let space: Space

  interface EventCoordinates {
    gridColumnStart: number
    gridColumnEnd: number
    gridRowStart: number
    gridRowEnd: number
    displayLayer: number
  }

  function getDate (date: Date | string) {
    if (typeof date === 'string') {
      return new Date(Date.parse(date as string))
    }
    return date
  }

  function isDateInInterval (eventDate: Date | undefined, intervalStart: Date, intervalEnd: Date | undefined): boolean {
    return (
      eventDate !== undefined &&
      eventDate.getTime() >= intervalStart.getTime() &&
      (intervalEnd === undefined || eventDate.getTime() <= intervalEnd.getTime())
    )
  }

  let events: CalendarEvent[] = []
  let visibleEvents: CalendarEvent[] = []
  const eventCoordinatesMap = new Map<string, EventCoordinates>()

  let firstDayOfCurrentMonth: Date
  let displayedWeeksCount: number

  $: query = liveQuery(query, calendar.class.CalendarEvent, { _space: space._id }, (docs) => {
    events = docs
  })

  $: {
    eventCoordinatesMap.clear()
    const lastDisplayedDate = new Date(firstDayOfCurrentMonth)
    lastDisplayedDate.setDate(lastDisplayedDate.getDate() + 7 * displayedWeeksCount)
    visibleEvents = events.filter(
      (value) =>
        isDateInInterval(getDate(value.startDate), firstDayOfCurrentMonth, lastDisplayedDate) ||
        isDateInInterval(value.endDate && getDate(value.endDate), firstDayOfCurrentMonth, lastDisplayedDate)
    )
    const processedEvents: CalendarEvent[] = []
    visibleEvents.forEach((event) => {
      const startDate = getDate(event.startDate)
      const endDate = event.endDate && getDate(event.endDate)
      const parentItemLayer = processedEvents
        .filter(
          (pe) =>
            isDateInInterval(startDate, getDate(pe.startDate), pe.endDate && getDate(pe.endDate)) ||
            isDateInInterval(endDate, getDate(pe.startDate), pe.endDate && getDate(pe.endDate))
        )
        .map((pe) => eventCoordinatesMap.get(pe._id)?.displayLayer || 0)
        .reduce((a, b) => (a > b ? a : b), 0)

      const startDateDiff = Math.floor((startDate.getTime() - firstDayOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24))
      const endDateDiff = Math.floor(
        ((endDate || startDate).getTime() - firstDayOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24)
      )
      eventCoordinatesMap.set(event._id, {
        gridColumnStart: (startDateDiff % 7) + 1,
        gridColumnEnd: (endDateDiff % 7) + 2,
        gridRowStart: Math.trunc(startDateDiff / 7) + 1,
        gridRowEnd: Math.trunc(endDateDiff / 7) + 1,
        displayLayer: parentItemLayer + 1
      })
      processedEvents.push(event)
    })
  }
</script>

<!--TODO 
  1. Display events that do not fit in one week
  2. Display user name
  3. Support events delete
  4. Display popup for events with displayLayer > 5
-->
<MonthCalendar mondayStart={true} cellHeight={125} bind:firstDayOfCurrentMonth bind:displayedWeeksCount>
  {#each visibleEvents as e}
    {#if eventCoordinatesMap.has(e._id) && eventCoordinatesMap.get(e._id).displayLayer <= 5}
      <div
        style={`
        grid-column-start: ${eventCoordinatesMap.get(e._id).gridColumnStart}; 
        grid-column-end: ${eventCoordinatesMap.get(e._id).gridColumnEnd};
        grid-row-start: ${eventCoordinatesMap.get(e._id).gridRowStart};
        grid-row-end: ${eventCoordinatesMap.get(e._id).gridRowEnd};
        margin-top: ${21 * (eventCoordinatesMap.get(e._id).displayLayer || 1)}px;
      `}>
        <div class="event">
          {e.summary}
        </div>
      </div>
    {/if}
  {/each}
</MonthCalendar>

<style lang="scss">
  .event {
    height: 20px;
    width: 100%;
    color: var(--theme-content-dark-color);
    background-color: #4396a2;
    text-align: center;
    border-radius: 3px;
  }
</style>
