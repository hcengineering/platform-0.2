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
  export let mondayStart: boolean = false
  export let weekFormat: "narrow" | "short" | "long" | undefined = 'short'
  export let date: Date = new Date()

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
</script>

<style lang="scss">
  .days-of-week,
  .days-of-month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
</style>

<div/>
