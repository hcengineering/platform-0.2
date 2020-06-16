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

export default defineComponent({
  components: {},
  props: {
    date: Date
  },
  setup(props) {
    return {
      isToday(date: Date) {
        let now = new Date()
        return (
          date.getFullYear() == now.getFullYear() &&
          date.getMonth() == now.getMonth() &&
          date.getDate() == now.getDate()
        )
      },
      isWeekend(date: Date) {
        return date.getDay() == 0 || date.getDay() == 6
      }
    }
  }
})
</script>

<template>
  <div class="erp-calednar td" :class="{
      'weekend': isWeekend(date) ,
      }">
    <div class="day-title" :class="{'today':isToday(date)}">
      <div>{{date.getDate() }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.erp-calendar {
  .td {
    display: table-cell;

    &.weekend {
      background-color: #2e2e2d;
    }
    .day-title {
      display: inline-block;
      width: 20px;
      height: 20px;
      text-align: center;

      &.today {
        display: inline-block;
        background-color: red;
        border-radius: 50%;
        color: white;
      }
    }
  }
}
</style>
