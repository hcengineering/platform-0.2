//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
import { StringProperty, Class, Ref, Doc, Emb, DateProperty, Mixin } from '@anticrm/core'
import type { Space, VDoc } from '@anticrm/domains'

import { User } from '@anticrm/contact'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import { Collab } from '@anticrm/chunter'

export enum HabitFieldType {
  Type, // possible values: habit, feature, defect
  Priority, // 1-high, 2-medium, etc.
  Status = 2,
  Link, // A link category, Blocked by, Caused by, etc.
  Label// A some labels used by habits
}

/**
 * Define a value of some field targeted by type.
 */
export interface HabitFieldValue extends Doc {
  // _id, it should be uniq across a field type, and it will be used as value for habit fields
  _space?: Ref<Space> // a space, to allow per space customization

  // TODO: Not sure if this kind of customization is required.
  // _overrideId: Ref<HabitFieldValue> // If defined, will extend and override some base field value.
  // _visible?: boolean // If specified per _space and had same, _id, will allow to hide

  type: HabitFieldType // A type to filter faster
  title: string // A title to be displayed for user
  action: string // A action title, to perform switch to this state.
  description?: string // A description could be used to show
  icon?: Asset // Icon to display if suitable
  color?: Asset // Define a item color if appropriate
}

/**
 * Define a link type.
 */
export enum HabitLinkType {
  Information, // Just a reference from one habit to another as information
  IsCausedBy, // A habit is caused by target habit
  IsBlockedBy, // A habit is blocked by target habit
  IsPartOf // A habit is a part of target habit
}

// Define some habit to habit referencing mechanism
export interface HabitLink extends VDoc {
  type: HabitLinkType

  // A target object
  source: Ref<Habit>

  // A target object
  target: Ref<Habit>

  description: string
}

/**
 * Time duration format, per defined working day. 8 hours.
 * 1h - 1 hour
 * 1d - 1 day == 8h
 * 1.5d - 1 day 4 hours.
 * 10m - 10 minutes
 * 1d 10m - 1 day 10 minutes.
 */
export type HabitTimeDuration = string

/**
 * Define a habit operation
 */
export interface WorkLog extends Emb {
  // A user spend time
  reporter: Ref<User>

  // A time spend on habit on day and how many is spend.
  date: DateProperty
  spendTime: HabitTimeDuration
}

/*
 * Define a habit object.
 */
export interface Habit extends Collab {
  title: StringProperty

  // Define a status field
  status: Ref<HabitFieldValue>

  // A current assignee user
  assignee?: Ref<User>[]

  // A participants
  participants: Ref<User>[]

  // A set of labels
  labels: Ref<HabitFieldValue>[]

  // A list of watch users, they will be notified about habit status changes according.
  // watchers: Ref<User>[]
}

/**
 * Type management for habit
 */
export interface TypedHabit extends Habit {
  // Define a habit type
  type: Ref<HabitFieldValue> // Value will be selectable from a HabitFieldValue.type == Type
}

/**
 * Priority management for habit
 */
export interface PrioritizedHabit extends Habit {
  // Define a habit priority
  priority: Ref<HabitFieldValue> // Value will be selectable from a HabitFieldValue.type == Type
}

/**
 * Time management for habit
 */
export interface TimeManagedHabit extends Habit {
  // estimate and remaining
  estimate: HabitTimeDuration
  remaining: HabitTimeDuration

  worklog: WorkLog[]

  // Due management
  completeDue: DateProperty
}

export interface VersionedHabit extends Habit {
  // A fix version
  fixVersion: string[]
  affectsVersion: string[]
}

export interface HabitService extends Service {
}

export const HABIT_STATUS_OPEN = 'habit:status.Open' as Ref<HabitFieldValue>

export default plugin('habit' as Plugin<HabitService>, {}, {
  icon: {
    Habit: '' as Asset,
    ArrowDown: '' as Asset
  },
  class: {
    Habit: '' as Ref<Class<Habit>>,
    HabitFieldValue: '' as Ref<Class<HabitFieldValue>>,
    HabitLink: '' as Ref<Class<HabitLink>>,
    WorkLog: '' as Ref<Class<WorkLog>>
  },
  mixin: {
    TypedHabit: '' as Ref<Mixin<TypedHabit>>,
    PrioritizedHabit: '' as Ref<Mixin<PrioritizedHabit>>,
    VersionedHabit: '' as Ref<Mixin<VersionedHabit>>,
    TimeManagedHabit: '' as Ref<Mixin<TimeManagedHabit>>
  },
  component: {
    HabitProperties: '' as AnyComponent,
    CreateHabit: '' as AnyComponent,
    HabitInfo: '' as AnyComponent,
    HabitCardPresenter: '' as AnyComponent,
    StatusPresenter: '' as AnyComponent
  }
})
