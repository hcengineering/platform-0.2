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
import core, { ArrayOf$, Class$, extendIds, Primary, Prop, RefTo$ } from '@anticrm/model'
import chunter, { TCollab } from '@anticrm/chunter/src/__model__'

import _personalEvent, {
  PersonalEvent, RecurrenceProperty
} from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { DateProperty, MODEL_DOMAIN, Ref, StringProperty } from '@anticrm/core'
import { UX } from '@anticrm/presentation/src/__model__'
import { TDoc } from '@anticrm/model/src/__model__'
import contact from '@anticrm/contact/src/__model__'

export const DOMAIN_PERSONAL_EVENT = 'personalEvent'

const personalEvent = extendIds(_personalEvent, {
  string: {
    Event_summary: '' as IntlString,
    Event_participants: '' as IntlString,
    Event_startDate: '' as IntlString,
    Event_endDate: '' as IntlString,
    Event_recurrence: '' as IntlString
  }
})

@Class$(personalEvent.class.RecurrenceProperty, core.class.Doc, MODEL_DOMAIN)
export class TRecurrenceProperty extends TDoc implements RecurrenceProperty {
    @Prop() type!: string
    @Prop() interval!: number
    @Prop() startDate!: string
    @Prop() endDate?: string
}

@Class$(personalEvent.class.PersonalEvent, chunter.class.Collab, DOMAIN_PERSONAL_EVENT)
@UX('Event' as IntlString)
export class TPersonalEvent extends TCollab implements PersonalEvent {
    @Primary()
    @Prop()
    @UX('Summary' as IntlString)
    summary!: StringProperty

    @UX(personalEvent.string.Event_participants)
    @ArrayOf$()
    @RefTo$(contact.mixin.User) participants!: Ref<User>[]

    @UX(personalEvent.string.Event_startDate)
    @Prop()
    startDate: DateProperty

    @UX(personalEvent.string.Event_endDate)
    @Prop()
    endDate: DateProperty

    @UX(personalEvent.string.Event_recurrence)
    @RefTo$(personalEvent.class.RecurrenceProperty) recurrence!: Ref<RecurrenceProperty>
}
