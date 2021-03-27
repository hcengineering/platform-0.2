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
import chunter, { TCollab } from '@anticrm/chunter/src/__model__'

import _calendar, {
  CalendarEvent, RecurrenceProperty, RecurrenceType, CalendarEventType
} from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { MODEL_DOMAIN, Ref } from '@anticrm/core'
import { UX } from '@anticrm/presentation/src/__model__'
import { TDoc, TEnum } from '@anticrm/model/src/__model__'
import workbench from '@anticrm/workbench/src/__model__'
import contact from '@anticrm/contact/src/__model__'

const calendar = extendIds(_calendar, {
  string: {
    Event_summary: '' as IntlString,
    Event_participants: '' as IntlString,
    Event_startDate: '' as IntlString,
    Event_endDate: '' as IntlString,
    Event_recurrence: '' as IntlString,
    Event_type: '' as IntlString
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
  @Literal(CalendarEventType) [CalendarEventType.PTO]!: any
  @Literal(CalendarEventType) [CalendarEventType.SICK_LEAVE]!: any
  @Literal(CalendarEventType) [CalendarEventType.EXTRA_WORK]!: any
  @Literal(CalendarEventType) [CalendarEventType.ORGANIZATION_EVENT]!: any
  @Literal(CalendarEventType) [CalendarEventType.CUSTOM]!: any
}

@Class$(calendar.class.RecurrenceProperty, core.class.Doc, MODEL_DOMAIN)
export class TRecurrenceProperty extends TDoc implements RecurrenceProperty {
    @UX(calendar.string.Event_type)
    @EnumValue$(calendar.enum.RecurrenceType) status!: RecurrenceType

    type!: RecurrenceType
    @Prop()
    interval!: number

    @Prop()
    startDate!: string

    @Prop()
    endDate?: string
}

@Class$(calendar.class.CalendarEvent, chunter.class.Collab, MODEL_DOMAIN)
@UX('Event' as IntlString)
export class TCalendarEvent extends TCollab implements CalendarEvent {
    @Primary()
    @Prop()
    @UX('Summary' as IntlString)
    summary!: string

    @UX(calendar.string.Event_type)
    @EnumValue$(calendar.enum.CalendarEventType) status!: CalendarEventType

    type!: CalendarEventType

    @UX(calendar.string.Event_participants)
    @ArrayOf$()
    @RefTo$(contact.mixin.User) participants!: Ref<User>[]

    @UX(calendar.string.Event_startDate)
    @Prop()
    startDate: Date

    @UX(calendar.string.Event_endDate)
    @Prop()
    endDate: Date

    @UX(calendar.string.Event_recurrence)
    @RefTo$(calendar.class.RecurrenceProperty) recurrence!: Ref<RecurrenceProperty>
}

export function model (S: Builder): void {
  S.add(TCalendarEvent, TRecurrenceProperty, TCalendarEventType, TRecurrenceType)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'calendar',
    label: 'Calendar' as string,
    component: workbench.component.Application,
    classes: [calendar.class.CalendarEvent],
    supportSpaces: true,
    spaceTitle: 'Project'
  }, calendar.application.Calendar)
}
