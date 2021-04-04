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
  import { DateProperty, generateId, Ref, StringProperty } from '@anticrm/core'
  import { Space } from '@anticrm/domains'
  import { getCoreService } from '@anticrm/presentation'
  import workbench from '@anticrm/workbench/src/__model__'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { CalendarEvent, CalendarEventType } from '../index'
  import calendar from '..'

  export let space: Ref<Space>
  const coreP = getCoreService()
  const modelP = coreP.then((c) => c.getModel())
  const dispatch = createEventDispatcher()
  // TODO
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 1)
  const newEvent: CalendarEvent = {
    _id: generateId(),
    _space: space,
    _class: calendar.class.CalendarEvent,
    _createdBy: '' as StringProperty,
    _createdOn: Date.now() as DateProperty,
    summary: '',
    startDate: new Date() as Date,
    endDate: endDate as Date,
    participants: [],
    type: CalendarEventType.Custom
  }

  async function save() {
    const core = await coreP
    const model = await modelP
    const doc = {
      ...newEvent,
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
  <ScrollView height="500px">
    <div class="form">
      <EditBox bind:value={newEvent.summary} label="Summary" placeholder="Summary" />
      <EditBox bind:value={newEvent.startDate} label="Start date" placeholder="Start date" />
      <EditBox bind:value={newEvent.endDate} label="End date" placeholder="End date" />
    </div>
  </ScrollView>
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
