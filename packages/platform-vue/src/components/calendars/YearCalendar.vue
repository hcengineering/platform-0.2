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
import { defineComponent, PropType, inject } from "vue";
import core, { Obj, Doc, Ref, Class, CoreService } from "@anticrm/platform-core";
import ui, { UIService } from "@anticrm/platform-ui";
import { injectPlatform } from "../..";

import MonthCalendar from "./MonthCalendar.vue";

export default defineComponent({
  components: { MonthCalendar },
  props: {
    /**
     * If passed, calendars will use monday as first day
     */
    mondayStart: { type: Boolean, default: true },
    /**
     * Initial date to be shown
     */
    date: {
      type: Date,
      default: () => new Date(),
    }
  },
  setup(props) {
    return {
      // date: props.date || new Date(),
      mondayStart: props.mondayStart || true,

      getMonthName(date: Date): string {
        let locale = new Intl.NumberFormat().resolvedOptions().locale
        return new Intl.DateTimeFormat(locale, { month: "long" }).format(date)
      },
      month(m: number): Date {
        let date = new Date(this.date)
        date.setMonth(m)
        return date;
      }
    };
  }
});
</script>

<template>
  <div class="year-erp-calendar">
    <div class="row" v-for="i in 3" v-bind:key="i">
      <div v-for="m in 4" class="calendar" v-bind:key="i*m">
        {{getMonthName(month((i-1)*4 + (m-1)))}}
        <MonthCalendar
          weekFormat="narrow"
          v-bind:date="month((i-1)*4 + (m-1))"
          v-bind:mondayStart="mondayStart"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.year-erp-calendar {
  border-collapse: collapse;
  background-color: $content-bg-color;
  .row {
    display: table-row;
  }
  .th {
    display: table-cell;
  }
  .calendar {
    display: table-cell;
    padding: 0.3em;
  }
}
</style>
