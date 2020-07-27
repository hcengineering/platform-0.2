<!--
// Copyright © 2020 Anticrm Platform Contributors.
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

<script lang="ts">
import { defineComponent, ref } from "vue";
import Calendar from "@anticrm/platform-vue/src/components/Calendar.vue";
import MonthCalendar from "@anticrm/platform-vue/src/components/calendars/MonthCalendar.vue";
import YearCalendar from "@anticrm/platform-vue/src/components/calendars/YearCalendar.vue";
import InfoPanel from "@anticrm/sparkling-controls/src/InfoPanel.vue";
import ScrollView from "@anticrm/sparkling-controls/src/ScrollView.vue";

import MonthCalendarControl from "@anticrm/sparkling-controls/src/MonthCalendar.vue";

export default defineComponent({
  components: { YearCalendar, MonthCalendar, Calendar, InfoPanel, MonthCalendarControl, ScrollView },
  setup(props) {
    return {
      date: new Date(),
    }
  }
});
</script>

<template>
  <div style="margin: 2em;  height: 100%;">
    <ScrollView style="height:100%">
    <InfoPanel caption="Calendars">
      <div>
        <div class="tr">Month Calendar Selector</div>
        <div class="tr">
          <div class="td">
            Selected {{date}}
            <MonthCalendarControl v-model="date" style="width: 100%; height: 500px;" />
          </div>
        </div>
        <div class="tr">Month Calendar Selector</div>
        <div class="tr">
          <div class="td">
            Selected {{date}}
            <MonthCalendarControl v-model="date" style="width: 100px" />
          </div>
        </div>
        <div class="tr">Full Calendar</div>
        <div class="tr">
          <div class="td">
            <Calendar v-bind:date="date" />
          </div>
        </div>
      </div>
    </InfoPanel>
    </ScrollView>
  </div>
</template>
