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
import { defineComponent, PropType, inject } from 'vue'
import core, { Obj, Doc, Ref, Class, CoreService } from '@anticrm/platform-core'
import ui, { UIService } from '@anticrm/platform-ui'
import { injectPlatform } from ".."

import MonthCalendar from "./calendars/MonthCalendar.vue"
import YearCalendar from "./calendars/YearCalendar.vue"
import Button from "@anticrm/sparkling-controls/src/Button.vue"

enum CalendarMode {
  Day, Week, Month, Year
}

export default defineComponent({
  components: { Button, MonthCalendar, YearCalendar },
  props: {
    /**
     * If passed, calendars will use monday as first day
     */
    mondayStart: Boolean,
    /**
     * Initial date to be shown
     */
    date: Date
  },
  setup(props) {
    return {
      mode: CalendarMode.Month,
      yearShift: 0,
      monthShift: 0,
      dayShift: 0,
      weekShift: 0,
      date: props.date || new Date(),
      inc(val: number) {
        if (val == 0) {
          this.dayShift = 0
          this.weekShift = 0
          this.monthShift = 0
          this.yearShift = 0
          return
        }
        switch (this.mode) {
          case CalendarMode.Day: {
            this.dayShift = val == 0 ? 0 : this.dayShift + val
            break
          }
          case CalendarMode.Week: {
            this.weekShift = val == 0 ? 0 : this.weekShift + val
            break
          }
          case CalendarMode.Month: {
            this.monthShift = val == 0 ? 0 : this.monthShift + val
            break
          }
          case CalendarMode.Year: {
            this.yearShift = val == 0 ? 0 : this.yearShift + val
            break
          }
        }
      },
      getMonthName(date: Date): string {
        let locale = new Intl.NumberFormat().resolvedOptions().locale
        return new Intl.DateTimeFormat(locale, {
          month: "long"
        }).format(date)
      },
      currentDate(): Date {
        let date = new Date(this.date)
        date.setMonth(this.date.getMonth() + this.monthShift)
        date.setFullYear(this.date.getFullYear() + this.yearShift)
        date.setDate(this.date.getDate() + this.dayShift + this.weekShift * 7)
        console.log("selected:", date)
        return date
      },
      label(): string {
        let date = this.currentDate()
        switch (this.mode) {
          case CalendarMode.Day: {
            return `${date.getDate()} ${this.getMonthName(
              date
            )} ${date.getFullYear()}`
          }
          case CalendarMode.Week: {
            return `${this.getMonthName(date)} ${date.getFullYear()}`
            break
          }
          case CalendarMode.Month: {
            return `${this.getMonthName(date)} ${date.getFullYear()}`
            break
          }
          case CalendarMode.Year: {
            return `${date.getFullYear()}`
            break
          }
        }
      }
    }
  }
})
</script>

<template>
  <div>
    <div class="row">
      <Button v-on:click="mode=0">Day</Button>
      <Button v-on:click="mode=1">Week</Button>
      <Button v-on:click="mode=2">Month</Button>
      <Button v-on:click="mode=3">Year</Button>
    </div>
    {{label()}}
    <MonthCalendar v-if="mode<3" v-bind:date="currentDate()" />
    <YearCalendar v-if="mode==3" v-bind:date="currentDate()" />
    <div class="row">
      <Button v-on:click="inc(-1)">&lt;</Button>
      <Button v-on:click="inc(0)">Today</Button>
      <Button v-on:click="inc(1)">&gt;</Button>
    </div>
    <div></div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.main-erp-calendar {
  display: table;
  border-collapse: collapse;
  background-color: $content-bg-color;
  border: 1px solid;
  .row {
    display: table-row;
    border: 1px solid;
  }
  .th {
    display: table-cell;
    border: 1px solid;
  }
  .calendar {
    display: table-cell;
    padding: 1em;
    border: 1px solid;
  }
}
</style>
