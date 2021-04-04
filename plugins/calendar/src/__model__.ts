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
import core, { ArrayOf$, Builder, Class$, Enum$, EnumValue$, extendIds, Literal, Primary, Prop, RefTo$ } from '@anticrm/model'

import _calendar, {
  Calendar, CalendarEvent, RecurrenceProperty, RecurrenceType, CalendarEventType
} from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { MODEL_DOMAIN, Ref } from '@anticrm/core'
import { UX } from '@anticrm/presentation/src/__model__'
import { TEmb, TEnum, TVDoc } from '@anticrm/model/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'
import contact from '@anticrm/contact/src/__model__'
import presentation from '@anticrm/presentation'

const calendar = extendIds(_calendar, {
  string: {
    Event_summary: '' as IntlString,
    Event_participants: '' as IntlString,
    Event_startDate: '' as IntlString,
    Event_endDate: '' as IntlString,
    Event_recurrence: '' as IntlString,
    Event_type: '' as IntlString,
    Calendar_participants: '' as IntlString
  }
})

@Enum$(calendar.enum.RecurrenceType)
class TRecurrenceType extends TEnum<RecurrenceType> {
  @Literal(RecurrenceType) [RecurrenceType.Daily]!: any
  @Literal(RecurrenceType) [RecurrenceType.Weekly]!: any
  @Literal(RecurrenceType) [RecurrenceType.Monthly]!: any
  @Literal(RecurrenceType) [RecurrenceType.Yearly]!: any
}

@Enum$(calendar.enum.CalendarEventType)
class TCalendarEventType extends TEnum<CalendarEventType> {
  @Literal(CalendarEventType) [CalendarEventType.Vacation]!: any
  @Literal(CalendarEventType) [CalendarEventType.PTO]!: any
  @Literal(CalendarEventType) [CalendarEventType.SickLeave]!: any
  @Literal(CalendarEventType) [CalendarEventType.ExtraWork]!: any
  @Literal(CalendarEventType) [CalendarEventType.OrganizationEvent]!: any
  @Literal(CalendarEventType) [CalendarEventType.Custom]!: any
}

@Class$(calendar.class.RecurrenceProperty, core.class.Emb, MODEL_DOMAIN)
export class TRecurrenceProperty extends TEmb implements RecurrenceProperty {
    @UX(calendar.string.Event_type)
    @EnumValue$(calendar.enum.RecurrenceType)
    type!: RecurrenceType

    @Prop(core.class.Number) interval!: number
    startDate!: Date
    endDate?: Date
}

@Class$(calendar.class.Calendar, core.class.VDoc, MODEL_DOMAIN)
@UX('Calendar' as IntlString)
export class TCalendar extends TVDoc implements Calendar {
    @Primary()
    @Prop()
    @UX('Name' as IntlString)
    name!: string

    @UX(calendar.string.Event_participants)
    @ArrayOf$()
    @RefTo$(contact.mixin.User)
    participants!: Ref<User>[]
}

@Class$(calendar.class.CalendarEvent, core.class.VDoc, MODEL_DOMAIN)
@UX('Event' as IntlString)
export class TCalendarEvent extends TVDoc implements CalendarEvent {
    @Primary()
    @Prop()
    @UX('Summary' as IntlString)
    summary!: string

    @EnumValue$(calendar.enum.CalendarEventType)
    type!: CalendarEventType

    @ArrayOf$()
    @RefTo$(contact.mixin.User) participants!: Ref<User>[]

    @Prop(core.class.Date) startDate!: Date

    @Prop(core.class.Date) endDate?: Date

    recurrence?: RecurrenceProperty
}

export function model (S: Builder): void {
  S.add(TCalendar, TCalendarEvent, TRecurrenceProperty, TCalendarEventType, TRecurrenceType)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'calendar',
    label: 'Calendar' as string,
    component: workbench.component.Application,
    classes: [calendar.class.CalendarEvent],
    supportSpaces: true,
    spaceTitle: 'Calendar'
  }, calendar.application.Calendar)

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: calendar.class.CalendarEvent,
    label: 'Calendar' as IntlString,
    component: calendar.component.EventsCalendar
  })

  S.mixin(calendar.class.CalendarEvent, presentation.mixin.CreateForm, {
    component: calendar.component.NewEventForm
  })
}
