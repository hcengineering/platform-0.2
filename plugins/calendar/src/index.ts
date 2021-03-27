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
import { StringProperty, Class, Ref, Doc, DateProperty } from '@anticrm/core'

import { User } from '@anticrm/contact'
import { Collab } from '@anticrm/chunter'
import { Application } from '@anticrm/domains'

export enum RecurrenceType {
    Daily,
    Weekly,
    Monthly,
    Yearly
}

export interface RecurrenceProperty extends Doc {
    type: RecurrenceType
    interval: number
    startDate: DateProperty
    endDate?: DateProperty
}

/*
 * Define a personal event object.
 */
export interface PersonalEvent extends Collab {
    summary: StringProperty

    participants: Ref<User>[]

    startDate: DateProperty

    endDate: DateProperty

    recurrence: RecurrenceProperty
}

export interface PersonalEventService extends Service {
}

export default plugin('personalEvent' as Plugin<PersonalEventService>, {}, {
  class: {
    PersonalEvent: '' as Ref<Class<PersonalEvent>>,
    RecurrenceProperty: '' as Ref<Class<RecurrenceProperty>>
  },
  application: {
    PersonalEvent: '' as Ref<Application>
  }
})
