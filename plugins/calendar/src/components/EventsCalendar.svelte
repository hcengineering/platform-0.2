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
  import { getContext } from 'svelte'

  import type { Platform } from '@anticrm/platform'
  import type { Space } from '@anticrm/domains'
  import type { Class, Doc, Ref } from '@anticrm/core'
  import presentation, { liveQuery, getCoreService } from '@anticrm/presentation'
  import ui, { AnyComponent } from '@anticrm/platform-ui'

  import type { CalendarEvent } from '..'
  import type { EventCoordinates } from './EventCoordinates'
  import EventPresenter from './EventPresenter.svelte'
  import calendar from '..'

  import MonthCalendar from '@anticrm/sparkling-controls/src/calendar/MonthCalendar.svelte'
  import Spinner from '@anticrm/platform-ui/src/components/internal/Spinner.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { QueryUpdater } from '@anticrm/platform-core'

  export let _class: Ref<Class<Doc>>
  export let space: Space

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

  const coreService = getCoreService()

  let events: CalendarEvent[] = []
  let visibleEvents: CalendarEvent[] = []
  const eventCoordinatesMap = new Map<string, EventCoordinates>()

  let firstDayOfCurrentMonth: Date
  let displayedWeeksCount: number

  let presenter: AnyComponent

  const platform = getContext('platform') as Platform

  $: component = presenter ? platform.getResource(presenter) : null

  $: {
    coreService.then((cs) => {
      const model = cs.getModel()
      const typeClass = model.get(_class) as Class<Doc>
      if (!model.isMixedIn(typeClass, presentation.mixin.Presenter)) {
        console.log(new Error(`no presenter for type '${_class}'`))
        // Use string presenter
        presenter = calendar.component.EventPresenter
      } else {
        presenter = model.as(typeClass, presentation.mixin.Presenter).presenter
      }
    })
  }

  let query: Promise<QueryUpdater<CalendarEvent>>

  $: query = liveQuery<CalendarEvent>(query, calendar.class.CalendarEvent, { _space: space._id }, (docs) => {
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
  function getEventCoordinate (id: string): number {
    return eventCoordinatesMap.get(id)!.displayLayer
  }
</script>

<MonthCalendar mondayStart={true} cellHeight={125} bind:firstDayOfCurrentMonth bind:displayedWeeksCount>
  {#each visibleEvents as e}
    {#if eventCoordinatesMap.has(e._id) && getEventCoordinate(e._id) <= 5}
      {#if component}
        {#await component}
          <Spinner />
        {:then ctor}
          <svelte:component this={ctor} event={e} coordinates={eventCoordinatesMap.get(e._id)} />
        {:catch err}
          <Icon icon={ui.icon.Error} size="32" />
        {/await}
      {:else}
        <EventPresenter event={e} coordinates={eventCoordinatesMap.get(e._id)} />
      {/if}
    {/if}
  {/each}
</MonthCalendar>
