//
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
//

import core, { ArrayOf$, Builder, Class$, extendIds, InstanceOf$, Mixin$, Primary, Prop, RefTo$ } from '@anticrm/model'
import _habit, {
  PrioritizedHabit, Habit, HABIT_STATUS_OPEN, HabitFieldType, HabitFieldValue, HabitLink, HabitLinkType, HabitTimeDuration,
  TimeManagedHabit,
  TypedHabit, VersionedHabit, WorkLog
} from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { UX } from '@anticrm/presentation/src/__model__'
import presentation from '@anticrm/presentation'
import workbench from '@anticrm/workbench/src/__model__'
import chunter, { TCollab } from '@anticrm/chunter/src/__model__'
import { DateProperty, MODEL_DOMAIN, Ref, StringProperty } from '@anticrm/core'
import { Application, Space } from '@anticrm/domains'
import { TDoc, TVDoc } from '@anticrm/model/src/__model__'
import contact from '@anticrm/contact/src/__model__'
import { Asset } from '@anticrm/platform-ui'

export const DOMAIN_HABIT = 'habit'

const habit = extendIds(_habit, {
  application: {
    Habit: '' as Ref<Application>
  },
  string: {
    Habit_name: '' as IntlString,
    Habit_assignee: '' as IntlString,
    Habit_participants: '' as IntlString,
    Habit_labels: '' as IntlString,
    Habit_status: '' as IntlString,
    Habit_type: '' as IntlString,
    Habit_priority: '' as IntlString,
    Habit_estimate: '' as IntlString,
    Habit_remaining: '' as IntlString,
    Habit_worklog: '' as IntlString,
    Habit_completeDue: '' as IntlString,
    Habit_fixVersion: '' as IntlString,
    Habit_affectsVersion: '' as IntlString
  },
  status: {
    Open: HABIT_STATUS_OPEN,
    ReOpened: '' as Ref<HabitFieldValue>,
    InProgress: '' as Ref<HabitFieldValue>,
    UnderReview: '' as Ref<HabitFieldValue>,
    Resolved: '' as Ref<HabitFieldValue>,
    Closed: '' as Ref<HabitFieldValue>
  }
})

@Class$(habit.class.HabitFieldValue, core.class.Doc, MODEL_DOMAIN)
export class THabitFieldValue extends TDoc implements HabitFieldValue {
  @RefTo$(core.class.Space) _space?: Ref<Space>

  @Prop() type!: HabitFieldType
  @Prop() title!: string
  @Prop() action!: string
  @Prop() description?: string
  @Prop() icon?: Asset
  @Prop() color?: Asset
}

@Class$(habit.class.HabitLink, core.class.VDoc, DOMAIN_HABIT)
export class THabitLink extends TVDoc implements HabitLink {
  @Prop() type!: HabitLinkType
  @RefTo$(habit.class.Habit) source!: Ref<Habit>
  @RefTo$(habit.class.Habit) target!: Ref<Habit>

  @Prop() description!: string
}

@Class$(habit.class.Habit, chunter.class.Collab, DOMAIN_HABIT)
@UX('Habit' as IntlString)
export class THabit extends TCollab implements Habit {
  @Primary()
  @Prop()
  @UX('Name' as IntlString)
  title!: StringProperty

  @UX(habit.string.Habit_assignee)
  @ArrayOf$()
  @RefTo$(contact.mixin.User) assignee!: Ref<User>[]

  @UX(habit.string.Habit_participants)
  @ArrayOf$()
  @RefTo$(contact.mixin.User) participants!: Ref<User>[]

  @UX(habit.string.Habit_labels)
  @ArrayOf$()
  @RefTo$(habit.class.HabitFieldValue) labels!: Ref<HabitFieldValue>[]

  @UX(habit.string.Habit_status, undefined, habit.component.StatusPresenter)
  @ArrayOf$()
  @RefTo$(habit.class.HabitFieldValue) status!: Ref<HabitFieldValue>
}

@Mixin$(habit.mixin.TypedHabit, habit.class.Habit)
class TTypeHabit extends THabit implements TypedHabit {
  @UX(habit.string.Habit_type)
  @ArrayOf$()
  @RefTo$(habit.class.HabitFieldValue) type!: Ref<HabitFieldValue>
}

@Mixin$(habit.mixin.PrioritizedHabit, habit.class.Habit)
class TPrioritizedHabit extends THabit implements PrioritizedHabit {
  @UX(habit.string.Habit_priority)
  @ArrayOf$()
  @RefTo$(habit.class.HabitFieldValue) priority!: Ref<HabitFieldValue>
}

@Mixin$(habit.mixin.TimeManagedHabit, habit.class.Habit)
class TTimeManagedHabit extends THabit implements TimeManagedHabit {
  @UX(habit.string.Habit_estimate)
  @Prop() estimate!: HabitTimeDuration

  @UX(habit.string.Habit_remaining)
  @Prop() remaining!: HabitTimeDuration

  @UX(habit.string.Habit_worklog)
  @ArrayOf$()
  @InstanceOf$(habit.class.WorkLog) worklog!: WorkLog[]

  @UX(habit.string.Habit_completeDue)
  @Prop() completeDue!: DateProperty
}

@Mixin$(habit.mixin.VersionedHabit, habit.class.Habit)
class TVersionedHabit extends THabit implements VersionedHabit {
  @UX(habit.string.Habit_fixVersion)
  @ArrayOf$() fixVersion!: string[]

  @UX(habit.string.Habit_affectsVersion)
  @ArrayOf$() affectsVersion!: string[]
}

export function model (S: Builder): void {
  S.add(THabit, THabitFieldValue, THabitLink)
  S.add(TTypeHabit, TPrioritizedHabit, TVersionedHabit, TTimeManagedHabit)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'habits',
    label: 'Habits' as StringProperty,
    icon: habit.icon.Habit,
    component: workbench.component.Application,
    classes: [habit.class.Habit],
    supportSpaces: true,
    spaceTitle: 'Project'
  }, habit.application.Habit)

  S.mixin(habit.class.Habit, presentation.mixin.DetailForm, {
    component: habit.component.HabitProperties
  })

  S.mixin(habit.class.Habit, presentation.mixin.CreateForm, {
    component: habit.component.CreateHabit
  })

  S.mixin(habit.class.Habit, chunter.mixin.ActivityInfo, {
    component: habit.component.HabitInfo
  })

  // Define some habit default styles
  const statuses = [
    {
      id: habit.status.Open,
      title: 'Open',
      action: 'Open',
      description: 'Habit is ready to be started',
      color: ''
    },
    {
      id: habit.status.Closed,
      title: 'Closed',
      action: 'Close',
      description: 'Habit is complete and verified',
      color: 'var(--status-red-color)'
    },
    {
      id: habit.status.InProgress,
      title: 'In progress',
      action: 'Start progress',
      description: 'Work on habit are started',
      color: 'var(--status-blue-color)'
    },
    {
      id: habit.status.UnderReview,
      title: 'Under review',
      action: 'Begin review',
      description: 'Habit is being reviewed',
      color: 'var(--status-orange-color)'
    },
    {
      id: habit.status.Resolved,
      title: 'Resolved',
      action: 'Resolve',
      description: 'Work on habit are complete, but verifcation are required',
      color: 'var(--status-grey-color)'
    }
  ]
  for (const s of statuses) {
    S.createDocument(habit.class.HabitFieldValue, {
      type: HabitFieldType.Status,
      title: s.title,
      action: s.action,
      description: s.description,
      color: s.color
    } as HabitFieldValue, s.id)
  }

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: habit.class.Habit,
    label: 'Card' as IntlString,
    component: habit.component.HabitCardPresenter
  })
}
