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
  import { createEventDispatcher } from 'svelte'
  import type { DateProperty, Ref, StringProperty } from '@anticrm/core'
  import { generateId } from '@anticrm/core'
  import type { Space } from '@anticrm/domains'
  import { getCoreService } from '@anticrm/presentation'
  import workbench from '@anticrm/workbench/src/__model__'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import DateInput from '@anticrm/sparkling-controls/src/DateInput.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import type { CalendarEvent } from '..'
  import calendar from '..'

  export let space: Ref<Space>
  const coreService = getCoreService()
  const dispatch = createEventDispatcher()

  const newEvent: CalendarEvent = {
    _id: generateId(),
    _space: space,
    _class: calendar.class.CalendarEvent,
    _createdBy: '' as StringProperty,
    _createdOn: Date.now() as DateProperty,
    summary: '',
    startDate: new Date() as Date,
    endDate: new Date() as Date,
    participants: []
  }

  function getAllDayEventStart (date: Date) {
    const eventStart = new Date(date.getTime())
    eventStart.setHours(0, 0, 0, 0)
    return eventStart
  }

  function getAllDayEventEnd (date: Date | undefined) {
    if (!date) {
      return undefined
    }
    const eventEnd = new Date(date.getTime())
    eventEnd.setHours(23, 59, 59, 999)
    return eventEnd
  }

  async function save () {
    const core = await coreService
    const doc = {
      ...newEvent,
      startDate: getAllDayEventStart(newEvent.startDate),
      endDate: getAllDayEventEnd(newEvent.endDate),
      _space: space, // Just to get latest space
      _createBy: core.getUserId()
    }
    await core.create(calendar.class.CalendarEvent, doc)
    dispatch('close')
  }
</script>

<div class="root">
  <div class="header">
    <div class="description">Add Event</div>
    <div on:click={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button={true} />
    </div>
  </div>
  <div class="form">
    <EditBox bind:value={newEvent.summary} label="Summary" placeholder="Summary" />
    <DateInput bind:value={newEvent.startDate} label="Start date" placeholder="Start date" />
    <DateInput bind:value={newEvent.endDate} label="End date" placeholder="End date" />
  </div>
  <div class="footer">
    <Button kind="primary" on:click={save} width="100%">Принять</Button>
    <Button on:click={() => dispatch('close')} width="100%">Отказаться</Button>
  </div>
</div>

<style lang="scss">
  .root {
    min-width: 450px;
    padding: 25px;
  }
  .header {
    display: flex;
    padding-bottom: 10px;
  }
  .description {
    flex-grow: 1;
    font-size: 18px;
    font-weight: 500;
  }
  .form {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
  .footer {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 10px;
    width: 100%;
    padding-top: 10px;
  }
</style>
