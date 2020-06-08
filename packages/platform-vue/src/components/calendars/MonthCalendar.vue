<!--
//
// Copyright 2020
//
//       Author: Andrey Sobolev (haiodo@gmail.com)
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
-->
<script lang="ts">
import { defineComponent, PropType, inject } from "vue";
import core, { Obj, Doc, Ref, Class, CoreService } from "@anticrm/platform-core";
import ui, { UIService } from "@anticrm/platform-ui";
import { injectPlatform } from "../..";

import CalendarDay from "./CalendarDay.vue";

export default defineComponent({
  components: { CalendarDay },
  props: {
    /**
     * If passed calendar will use Monday as first day.
     */
    mondayStart: Boolean,
    weekFormat: String,
    /**
     * Date to show calendar month on.
     */
    date: Date,
  },
  async setup(props) {
    console.log("setup", props.date)
    return {
      // date: props.date || new Date(),
      weekFormat: props.weekFormat || 'short',
      mondayStart: props.mondayStart || true,
      /**
       * Return a month calendar first day
       * @param mondayStart
       * @param date
       */
      firstDay(): Date {
        let firstDayOfMonth = new Date(this.date)
        firstDayOfMonth.setDate(1) // First day of month
        let result = new Date(firstDayOfMonth)
        result.setDate(
          result.getDate() - result.getDay() + (this.mondayStart ? 1 : 0)
        )

        // Check if we Need add one more week
        if (result.getTime() > firstDayOfMonth.getTime()) {
          result.setDate(result.getDate() - 7)
        }
        return result
      },
      /**
       * Return a weekday name
       */
      getWeekDayName(weekDay: Date): string {
        let locale = new Intl.NumberFormat().resolvedOptions().locale;
        return new Intl.DateTimeFormat(locale, {
          weekday: this.weekFormat
        }).format(weekDay)
      },
      /**
       * Return firstDay with offset to passed offset
       */
      day(offset: number): Date {
        return new Date(this.firstDay().getTime() + offset * 86400000)
      }
    };
  }
});
</script>

<template>
  <div class="erp-calendar">
    <div class="thead">
      <div class="th" v-for="d in 7" :key="'w_'+d">{{getWeekDayName(day(d-1))}}</div>
    </div>
    <div class="tbody">
      <div class="tr" v-for="w in 6" :key="'week_'+w">
        <CalendarDay v-for="d in 7" :key="'d_'+d" v-bind:date="day((w-1)*7 + (d-1))" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.erp-calendar {
  display: table;
  border-collapse: collapse;
  background-color: $content-bg-color;

  .tr {
    display: table-row;
  }

  .thead {
    display: table-header-group;
  }

  .th {
    display: table-cell;
    // padding: 0.5em;
    text-align: center;
  }

  .tbody {
    display: table-row-group;

    .tr {
      border-bottom: $border-default;
    }
  }
}
</style>
