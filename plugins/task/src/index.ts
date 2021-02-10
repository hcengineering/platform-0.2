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

export enum TaskFieldType {
  Type, // possible values: task, feature, defect
  Priority, // 1-high, 2-medium, etc.
  Status = 2,
  Link, // A link category, Blocked by, Caused by, etc.
  Label// A some labels used by tasks
}

/**
 * Define a value of some field targeted by type.
 */
export interface TaskFieldValue extends Doc {
  // _id, it should be uniq across a field type, and it will be used as value for task fields
  _space?: Ref<Space> // a space, to allow per space customization

  // TODO: Not sure if this kind of customization is required.
  // _overrideId: Ref<TaskFieldValue> // If defined, will extend and override some base field value.
  // _visible?: boolean // If specified per _space and had same, _id, will allow to hide

  type: TaskFieldType // A type to filter faster
  title: string // A title to be displayed for user
  action: string // A action title, to perform switch to this state.
  description?: string // A description could be used to show
  icon?: Asset // Icon to display if suitable
  color?: Asset // Define a item color if appropriate
}

/**
 * Define a link type.
 */
export enum TaskLinkType {
  Information, // Just a reference from one task to another as information
  IsCausedBy, // A task is caused by target task
  IsBlockedBy, // A task is blocked by target task
  IsPartOf // A task is a part of target task
}

// Define some task to task referencing mechanism
export interface TaskLink extends VDoc {
  type: TaskLinkType

  // A target object
  source: Ref<Task>

  // A target object
  target: Ref<Task>

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
export type TaskTimeDuration = string

/**
 * Define a task operation
 */
export interface WorkLog extends Emb {
  // A user spend time
  reporter: Ref<User>

  // A time spend on task on day and how many is spend.
  date: DateProperty
  spendTime: TaskTimeDuration
}

/*
 * Define a task object.
 */
export interface Task extends Collab {
  title: StringProperty

  // Define a status field
  status: Ref<TaskFieldValue>

  // A current assignee user
  assignee?: Ref<User>[]

  // A participants
  participants: Ref<User>[]

  // A set of labels
  labels: Ref<TaskFieldValue>[]

  // A list of watch users, they will be notified about task status changes according.
  // watchers: Ref<User>[]
}

/**
 * Type management for task
 */
export interface TypedTask extends Task {
  // Define a task type
  type: Ref<TaskFieldValue> // Value will be selectable from a TaskFieldValue.type == Type
}

/**
 * Priority management for task
 */
export interface PrioritizedTask extends Task {
  // Define a task priority
  priority: Ref<TaskFieldValue> // Value will be selectable from a TaskFieldValue.type == Type
}

/**
 * Time management for task
 */
export interface TimeManagedTask extends Task {
  // estimate and remaining
  estimate: TaskTimeDuration
  remaining: TaskTimeDuration

  worklog: WorkLog[]

  // Due management
  completeDue: DateProperty
}

export interface VersionedTask extends Task {
  // A fix version
  fixVersion: string[]
  affectsVersion: string[]
}

export interface TaskService extends Service {
}

export const TASK_STATUS_OPEN = 'task:status.Open' as Ref<TaskFieldValue>

export default plugin('task' as Plugin<TaskService>, {}, {
  icon: {
    Task: '' as Asset,
    ArrowDown: '' as Asset
  },
  class: {
    Task: '' as Ref<Class<Task>>,
    TaskFieldValue: '' as Ref<Class<TaskFieldValue>>,
    TaskLink: '' as Ref<Class<TaskLink>>,
    WorkLog: '' as Ref<Class<WorkLog>>
  },
  mixin: {
    TypedTask: '' as Ref<Mixin<TypedTask>>,
    PrioritizedTask: '' as Ref<Mixin<PrioritizedTask>>,
    VersionedTask: '' as Ref<Mixin<VersionedTask>>,
    TimeManagedTask: '' as Ref<Mixin<TimeManagedTask>>
  },
  component: {
    TaskProperties: '' as AnyComponent,
    CreateTask: '' as AnyComponent,
    TaskInfo: '' as AnyComponent
  }
})
