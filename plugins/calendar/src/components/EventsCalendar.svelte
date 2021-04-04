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
  import { Space } from '@anticrm/domains'
  import { createLiveQuery, updateLiveQuery } from '@anticrm/presentation'

  import calendar, { CalendarEvent } from '..'

  import MonthCalendar from '@anticrm/sparkling-controls/src/calendar/MonthCalendar.svelte'

  export let space: Space

  function getDate(date: Date | string) {
    if (typeof date === 'string') {
      return new Date(Date.parse(date as string)).getDate()
    }
    return date.getDate()
  }

  let events: CalendarEvent[] = []

  let firstDayOfCurrentMonth: Date

  const query = createLiveQuery(calendar.class.CalendarEvent, { _space: space._id }, (docs) => {
    events = docs
  })

  $: {
    updateLiveQuery(query, calendar.class.CalendarEvent, {
      _space: space._id
    })
  }
</script>

<MonthCalendar bind:firstDayOfCurrentMonth>
  {#each events as e}
    <div
      style={`
        grid-column-start: ${(Math.max(0, getDate(e.startDate) - getDate(firstDayOfCurrentMonth)) % 7) + 1}; 
        grid-column-end: ${getDate(e.endDate || e.startDate) - (firstDayOfCurrentMonth.getDate() % 7) + 1};
        grid-row-start: ${Math.trunc(getDate(e.endDate || e.startDate) - firstDayOfCurrentMonth.getDate() / 7 + 1)};
        grid-row-end: ${Math.trunc(getDate(e.endDate || e.startDate) - firstDayOfCurrentMonth.getDate() / 7) + 1};
      `}
    >
      <div class="event">
        {e.summary}
      </div>
    </div>
  {/each}
</MonthCalendar>

<style lang="scss">
  .event {
    margin-top: 20px;
    height: 20px;
    width: 100%;
    color: var(--theme-content-dark-color);
    background-color: #4396a2;
    text-align: center;
    border-radius: 3px;
  }
</style>
