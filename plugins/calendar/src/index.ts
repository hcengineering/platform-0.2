//
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
//

import { plugin, Plugin, Service } from '@anticrm/platform'
import { Class, Ref, Enum, Emb } from '@anticrm/core'

import { User } from '@anticrm/contact'
import { Application, VDoc } from '@anticrm/domains'
import { AnyComponent } from '@anticrm/platform-ui'

export enum RecurrenceType {
    Daily,
    Weekly,
    Monthly,
    Yearly
}

export enum CalendarEventType {
  Vacation,
  PTO,
  SickLeave,
  ExtraWork,
  OrganizationEvent,
  Custom
}

export interface RecurrenceProperty extends Emb {
    type: RecurrenceType
    interval: number
    startDate: Date
    endDate?: Date
}

export interface Calendar extends VDoc {
    name: string

    participants: Ref<User>[]
}

/*
 * Define a calendar event object.
 */
export interface CalendarEvent extends VDoc {
    summary: string

    type: CalendarEventType

    participants: Ref<User>[]

    startDate: Date

    endDate?: Date

    recurrence?: RecurrenceProperty
}

export interface CalendarService extends Service {
}

export default plugin('Calendar' as Plugin<CalendarService>, {}, {
  class: {
    Calendar: '' as Ref<Class<Calendar>>,
    CalendarEvent: '' as Ref<Class<CalendarEvent>>,
    RecurrenceProperty: '' as Ref<Class<RecurrenceProperty>>
  },
  enum: {
    RecurrenceType: '' as Ref<Enum<RecurrenceType>>,
    CalendarEventType: '' as Ref<Enum<CalendarEventType>>
  },
  component: {
    NewEventForm: '' as AnyComponent,
    EventsCalendar: '' as AnyComponent
  },
  application: {
    Calendar: '' as Ref<Application>
  }
})
