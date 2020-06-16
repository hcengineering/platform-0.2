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
import { defineComponent, PropType, inject } from 'vue';
import core, { Obj, Doc, Ref, Class, CoreService } from '@anticrm/platform-core';
import ui, { UIService } from '@anticrm/platform-ui';

export default defineComponent({
  components: {},
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
    console.log("setup", props.modelValue)
    return {
      selected: props.modelValue,
      /**
       * Return a month calendar first day
       * @param mondayStart
       * @param date
       */
      firstDay(): Date {
        let firstDayOfMonth = new Date(this.modelValue)
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
      }
    };
  }
});
</script>

<template>
  <div class="erp-calendar-control">
    <div class="thead">
      <div class="th" v-for="d in 7" :key="'w_'+d">{{getWeekDayName(day(d-1))}}</div>
    </div>
    <div class="tbody">
      <div class="tr" v-for="w in 6" :key="'week_'+w">
        <div
          v-for="d in 7"
          :key="'d_'+d"
          class="td"
          :set="dd=wday(w,d)"
          :class="{'weekend': isWeekend(wday(w,d))}"
          v-on:click="onSelect(wday(w,d))"
        >
          <div class="day-title" :class="{'today':isToday(dd), 'selected':isSelected(dd)}">
            {{dd.getDate() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.erp-calendar-control {
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
  .td {
    display: table-cell;
    :hover {
      background-color: red;
      position: absolute;
      margin: -1px -1px 1px -1px;
      box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
    }
    &.weekend {
      background-color: #2e2e2d;
    }
    .day-title {
      display: inline-block;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      div {
        // child divs, should not be pointered
        pointer-events: none;
      }
      &.today {
        display: inline-block;
        background-color: red;
        position: absolute;
        border-radius: 50%;
        color: white;
        vertical-align: middle;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
      }
      &.selected {
        display: inline-block;
        background-color: blue;
        position: absolute;
        border-radius: 50%;
        color: white;
        vertical-align: middle;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
      }
    }
  }

  .tbody {
    display: table-row-group;

    .tr {
      border-bottom: $border-default;
    }
  }
}
</style>
