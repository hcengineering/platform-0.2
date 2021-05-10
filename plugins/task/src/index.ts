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
import { Class, DateProperty, Emb, Enum, Mixin, Ref, StringProperty } from '@anticrm/core'
import type { Space, VDoc } from '@anticrm/domains'
import { WorkbenchApplication } from '@anticrm/workbench'

import { User } from '@anticrm/contact'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import { Collab } from '@anticrm/chunter'
import { FSMItem } from '@anticrm/fsm'

export interface TaskFSMItem extends FSMItem {}

export enum TaskType {
  Task,
  Issue,
  Defect
}

export enum TaskPriority {
  Blocker,
  High,
  Medium,
  Low
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

/**
 * Define a label value.
 */
export interface TaskLabel extends VDoc {
  title: string
  color: Asset
}

/*
 * Define a task object.
 */
export interface Task extends Collab {
  title: StringProperty

  // A current assignee user
  assignee?: Array<Ref<User>>

  // A participants
  participants?: Array<Ref<User>>

  // A set of labels
  labels?: Array<Ref<TaskLabel>>

  // A list of watch users, they will be notified about task status changes according.
  // watchers: Ref<User>[]
}

/**
 * Type management for task
 */
export interface TypedTask extends Task {
  // Define a task type
  type: TaskType // Value will be selectable from a TaskFieldValue.type == Type
}

/**
 * Priority management for task
 */
export interface PrioritizedTask extends Task {
  // Define a task priority
  priority: TaskPriority // Value will be selectable from a TaskFieldValue.type == Type
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

export interface Project extends Space {}

export interface TaskService extends Service {
}

export default plugin('task' as Plugin<TaskService>, {}, {
  icon: {
    Task: '' as Asset,
    ArrowDown: '' as Asset
  },
  class: {
    Task: '' as Ref<Class<Task>>,
    TaskFSMItem: '' as Ref<Class<TaskFSMItem>>,
    TaskLink: '' as Ref<Class<TaskLink>>,
    WorkLog: '' as Ref<Class<WorkLog>>,
    TaskLabel: '' as Ref<Class<TaskLabel>>,
    Project: '' as Ref<Class<Project>>
  },
  enum: {
    TaskPriority: '' as Ref<Enum<TaskPriority>>,
    TaskType: '' as Ref<Enum<TaskType>>
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
    TaskInfo: '' as AnyComponent,
    CardForm: '' as AnyComponent,
    CreateProject: '' as AnyComponent
  },
  application: {
    Task: '' as Ref<WorkbenchApplication>
  }
})
