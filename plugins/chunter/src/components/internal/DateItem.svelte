<script lang="ts">
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

  export let dateItem: Date

  const month = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря'
  ]
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

  const day: number = new Date(dateItem).getDate()
  const iDay: number = new Date(dateItem).getDay()
  const iMonth: number = new Date(dateItem).getMonth()
</script>

<div class="message-item">
  <div class="icon" class:holy={!iDay}>{day}</div>
  <div class="details">
    {month[iMonth + 1]}, {days[iDay]}
  </div>
</div>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  .message-item {
    display: flex;
    padding-top: 2em;
    margin-bottom: 1em;

    .icon {
      padding-top: 9px;
      width: 34px;
      height: 34px;
      text-align: center;
      font-weight: 500;
      color: #32302e;
      position: relative;
      z-index: 100;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 1px;
        width: 34px;
        height: 34px;
        background-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='32' height='32' rx='4' fill='%23BF3029'/%3E%3Crect y='4' width='32' height='28' fill='%23F2F2F2'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        z-index: -1;
      }
    }
    .holy {
      color: $theme-status-maroon-color;
    }

    .details {
      padding-top: 1em;
      padding-left: 1em;
      position: relative;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      &::before {
        position: absolute;
        content: '';
        left: -17px;
        top: -3em;
        height: calc(100% + 4em);
        width: 1px;
        z-index: 50;
      }
    }
  }
  :global(.theme-dark) .details {
    color: $theme-dark-content-color;
    &::before {
      background-color: $theme-dark-bg-dark-color;
    }
  }
  :global(.theme-grey) .details {
    color: $theme-grey-content-color;
    &::before {
      background-color: $theme-grey-bg-dark-color;
    }
  }
  :global(.theme-light) .details {
    color: $theme-light-content-color;
    &::before {
      background-color: $theme-light-bg-dark-color;
    }
  }
</style>
