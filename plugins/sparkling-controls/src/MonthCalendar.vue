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
import { defineComponent, PropType, inject } from 'vue';
import core, { Obj, Doc, Ref, Class, CoreService } from '@anticrm/platform-core';
import ui, { UIService } from '@anticrm/platform-ui';
import Button from './Button.vue';

export default defineComponent({
  components: { Button },
  props: {
    /**
     * If passed calendar will use Monday as first day.
     */
    mondayStart: {
      type: Boolean,
      default: true,
    },
    weekFormat: {
      type: String,
      default: "short",
    },
    /**
     * Date to show calendar month on.
     */
    modelValue: {
      type: Date,
      default: () => new Date()
    },
  },
  setup(props) {
    return {
      // A current date we show calendar for
      currentDate: new Date(props.modelValue),
      selected: props.modelValue,
      /**
       * Return a month calendar first day
       * @param mondayStart
       * @param date
       */
      firstDay(): Date {
        let firstDayOfMonth = new Date(this.currentDate)
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
      },
      wday(w, d: number): Date {
        return this.day((w - 1) * 7 + (d - 1));
      },
      isToday(date: Date) {
        let now = new Date()
        return (
          date.getFullYear() == now.getFullYear() &&
          date.getMonth() == now.getMonth() &&
          date.getDate() == now.getDate()
        )
      },
      isSelected(date: Date) {
        let s = this.selected
        return (
          date.getFullYear() == s.getFullYear() &&
          date.getMonth() == s.getMonth() &&
          date.getDate() == s.getDate()
        )
      },
      isWeekend(date: Date) {
        return date.getDay() == 0 || date.getDay() == 6
      },
      onSelect(date: Date) {
        this.selected = date;
        this.$emit('update:modelValue', date);
      },
      getMonthName(date: Date): string {
        let locale = new Intl.NumberFormat().resolvedOptions().locale
        return new Intl.DateTimeFormat(locale, { month: "long" }).format(date)
      },
      incMonth(val: number) {
        if (val == 0) {
          this.currentDate = new Date();
          return;
        }
        let dte = new Date(this.currentDate);
        dte.setMonth(dte.getMonth() + val);
        this.currentDate = dte;
      }
    };
  }
});
</script>

<template>
  <div class="erp-month-calendar-widget">
    <div class="buttons">
      <div class="monthName">{{getMonthName(currentDate) + " " + currentDate.getFullYear()}}</div>
      <div class="controls">
        <Button class="small" v-on:click="incMonth(-1)">&lt;</Button>
        <Button class="small" v-on:click="incMonth(0)">today</Button>
        <Button class="small" v-on:click="incMonth(1)">&gt;</Button>
      </div>
    </div>
    <div class="erp-month-calendar-control">
      <div class="thead">
        <div class="th" v-for="d in 7" :key="'w_'+d">{{getWeekDayName(day(d-1))}}</div>
      </div>
      <div class="tbody">
        <div class="tr" v-for="w in 6" :key="'week_'+w">
          <div v-for="d in 7" :key="'d_'+d" class="td" v-on:click="onSelect(wday(w,d))">
            <div
              class="cell"
              :class="{
              'weekend': isWeekend(wday(w,d)),
              'today':isToday(wday(w,d)),
              'selected':isSelected(wday(w,d))}"
            >{{wday(w,d).getDate() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.erp-month-calendar-widget {
  .buttons {
    width: 100%;
    display: flex;
    .monthName {
      display: flex;
      white-space: nowrap;
      margin: auto auto auto 0;
    }
    .controls {
      display: flex;
      // justify-content: flex-end;
    }
  }
  .erp-month-calendar-control {
    width: 100%;
    height: 100%;
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
      user-select: none;
      text-align: center;
      min-width: 2em; // Make cells size equal
    }
    .td {
      display: table-cell;
      user-select: none;
      vertical-align: middle;
      text-align: center;

      .weekend {
        background-color: #2e2e2d;
      }
      .today {
        color: #a66600;
      }
      .selected {
        color: white;
        border-radius: 3px;
        background: linear-gradient(145deg, #985e00, #b56f00);
      }
      .cell {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .cell:hover {
        border-radius: 3px;
        background: #929292;
        transform: perspective(600px) translate3d(0, 0, 150px);
        transition: transform 0.3s;
        box-shadow: 3px 3px 3px #2e2e2d;
      }
    }

    .tbody {
      display: table-row-group;
      height: 100%;

      .tr {
        border-bottom: $border-default;
      }
    }
  }
}
</style>
