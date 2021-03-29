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
  import {} from './DateUtils';

  export let mondayStart: boolean = false
  export let weekFormat: "narrow" | "short" | "long" | undefined = 'short'
  export let date: Date = new Date()
  let currentDate: Date = new Date()
  let selected: Date = new Date()

  function firstDay(): Date {
    let firstDayOfMonth = new Date(date)
    firstDayOfMonth.setDate(1) // First day of month
    let result = new Date(firstDayOfMonth)
    result.setDate(
      result.getDate() - result.getDay() + (mondayStart ? 1 : 0)
    )
    // Check if we Need add one more week
    if (result.getTime() > firstDayOfMonth.getTime()) {
      result.setDate(result.getDate() - 7)
    }
    return result
  }

  function getWeekDayName(weekDay: Date): string {
    let locale = new Intl.NumberFormat().resolvedOptions().locale;
    return new Intl.DateTimeFormat(locale, {
      weekday: weekFormat
    }).format(weekDay)
  }

  function day(offset: number): Date {
   return new Date(firstDay().getTime() + offset * 86400000)
  }

  function wday(w: any, d: number): Date {
        return day((w - 1) * 7 + (d - 1));
  }

  function isToday(date: Date) {
        let now = new Date()
        return (
          date.getFullYear() == now.getFullYear() &&
          date.getMonth() == now.getMonth() &&
          date.getDate() == now.getDate()
        )
      }

  function isSelected(date: Date) {
        let s = selected
        return (
          date.getFullYear() == s.getFullYear() &&
          date.getMonth() == s.getMonth() &&
          date.getDate() == s.getDate()
        )
      }

  function isWeekend(date: Date) {
        return date.getDay() == 0 || date.getDay() == 6
  }
  function onSelect(date: Date) {
        selected = date;
  }
  function getMonthName(date: Date): string {
        let locale = new Intl.NumberFormat().resolvedOptions().locale
        return new Intl.DateTimeFormat(locale, { month: "long" }).format(date)
  }
  function incMonth(val: number) {
        if (val == 0) {
          currentDate = new Date();
          return;
        }
        let dte = new Date(currentDate);
        dte.setMonth(dte.getMonth() + val);
        currentDate = dte;
      }
</script>

<style lang="scss">
  .selected-month {
    display: flex;
    justify-content: center;
  }
  .days-of-week-header,
  .days-of-month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
</style>

<div class="month-calendar">
  <div class="selected-month">
    <div class="monthName">{getMonthName(currentDate) + " " + currentDate.getFullYear()}</div>
  </div>
</div>