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

import core, {
  ArrayOf$, Builder, Class$, Enum$, EnumValue$, extendIds, InstanceOf$, Literal, Mixin$, Primary, Prop, RefTo$,
  withMixin
} from '@anticrm/model'
import _task, {
  PrioritizedTask, Task, TaskLabel, TaskLink, TaskLinkType, TaskPriority, TaskStatus, TaskStatusAction,
  TaskTimeDuration, TaskType, TimeManagedTask, TypedTask, VersionedTask, WorkLog
} from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { UX } from '@anticrm/presentation/src/__model__'
import presentation from '@anticrm/presentation'
import workbench from '@anticrm/workbench/src/__model__'
import chunter, { TCollab } from '@anticrm/chunter/src/__model__'
import { DateProperty, MODEL_DOMAIN, Ref, StringProperty } from '@anticrm/core'
import { TEmb, TEnum, TVDoc } from '@anticrm/model/src/__model__'
import contact from '@anticrm/contact/src/__model__'
import { Asset } from '@anticrm/platform-ui'
import { Metadata } from '@anticrm/platform'

export const DOMAIN_TASK = 'task'

const task = extendIds(_task, {
  string: {
    Task_name: '' as IntlString,
    Task_assignee: '' as IntlString,
    Task_participants: '' as IntlString,
    Task_labels: '' as IntlString,
    Task_status: '' as IntlString,
    Task_type: '' as IntlString,
    Task_priority: '' as IntlString,
    Task_estimate: '' as IntlString,
    Task_remaining: '' as IntlString,
    Task_worklog: '' as IntlString,
    Task_completeDue: '' as IntlString,
    Task_fixVersion: '' as IntlString,
    Task_affectsVersion: '' as IntlString
  }
})

@Class$(task.class.TaskLabel, core.class.VDoc, MODEL_DOMAIN)
export class TTaskLabel extends TVDoc implements TaskLabel {
  @Prop() title!: string
  @Prop() color!: Asset
}

@Class$(task.class.TaskLink, core.class.VDoc, DOMAIN_TASK)
export class TTaskLink extends TVDoc implements TaskLink {
  @Prop() type!: TaskLinkType
  @RefTo$(task.class.Task) source!: Ref<Task>
  @RefTo$(task.class.Task) target!: Ref<Task>

  @Prop() description!: string
}

@Class$(task.class.Task, chunter.class.Collab, DOMAIN_TASK)
@UX('Task' as IntlString)
export class TTask extends TCollab implements Task {
  @Primary()
  @Prop()
  @UX('Name' as IntlString)
  title!: StringProperty

  @UX(task.string.Task_assignee)
  @ArrayOf$()
  @RefTo$(contact.mixin.User) assignee!: Ref<User>[]

  @UX(task.string.Task_participants)
  @ArrayOf$()
  @RefTo$(contact.mixin.User) participants!: Ref<User>[]

  @UX(task.string.Task_labels)
  @ArrayOf$()
  @RefTo$(task.class.TaskLabel) labels!: Ref<TaskLabel>[]

  @UX(task.string.Task_status, { presenter: task.component.StatusPresenter })
  @EnumValue$(task.enum.TaskStatus) status!: TaskStatus
}

@Mixin$(task.mixin.TypedTask, task.class.Task)
class TTypeTask extends TTask implements TypedTask {
  @UX(task.string.Task_type)
  @EnumValue$(task.enum.TaskType) type!: TaskType
}

@Mixin$(task.mixin.PrioritizedTask, task.class.Task)
class TPrioritizedTask extends TTask implements PrioritizedTask {
  @UX(task.string.Task_priority)
  @EnumValue$(task.enum.TaskPriority) priority!: TaskPriority
}

@Mixin$(task.mixin.TimeManagedTask, task.class.Task)
class TTimeManagedTask extends TTask implements TimeManagedTask {
  @UX(task.string.Task_estimate)
  @Prop() estimate!: TaskTimeDuration

  @UX(task.string.Task_remaining)
  @Prop() remaining!: TaskTimeDuration

  @UX(task.string.Task_worklog)
  @ArrayOf$()
  @InstanceOf$(task.class.WorkLog) worklog!: WorkLog[]

  @UX(task.string.Task_completeDue)
  @Prop() completeDue!: DateProperty
}

@Mixin$(task.mixin.VersionedTask, task.class.Task)
class TVersionedTask extends TTask implements VersionedTask {
  @UX(task.string.Task_fixVersion)
  @ArrayOf$() fixVersion!: string[]

  @UX(task.string.Task_affectsVersion)
  @ArrayOf$() affectsVersion!: string[]
}

@Mixin$(task.mixin.TaskStatusAction, core.class.Emb)
class TTaskStatusAction extends TEmb implements TaskStatusAction {
  @Prop() action!: string // A action title, to perform switch to this state.
  @Prop() description?: string // A description could be used to show
}

@Enum$(task.enum.TaskStatus)
class TTaskStatusEnum extends TEnum<TaskStatus> {
  @UX('Open' as IntlString, {
    color: 'var(--status-green-color)' as Metadata<string>
  })
  @withMixin(task.mixin.TaskStatusAction, {
    action: 'Open',
    description: 'Task is ready to be started'
  })
  @Literal(TaskStatus) [TaskStatus.Open]!: any

  @UX('Close' as IntlString, { color: 'var(--status-grey-color)' as Metadata<string> })
  @withMixin(task.mixin.TaskStatusAction, {
    action: 'Close',
    description: 'Task is complete and verified'
  })
  @Literal(TaskStatus) [TaskStatus.Closed]!: any

  @UX('InProgress' as IntlString, { color: 'var(--status-green-color)' as Metadata<string> })
  @withMixin(task.mixin.TaskStatusAction, {
    action: 'Start progress',
    description: 'Work on task are started'
  })
  @Literal(TaskStatus) [TaskStatus.InProgress]!: any

  @UX('UnderReview' as IntlString, { color: 'var(--status-orange-color)' as Metadata<string> })
  @withMixin(task.mixin.TaskStatusAction, {
    action: 'Begin review',
    description: 'Task is being reviewed'
  })
  @Literal(TaskStatus) [TaskStatus.UnderReview]!: any

  @UX('Resolved' as IntlString, { color: 'var(--status-orange-color)' as Metadata<string> })
  @withMixin(task.mixin.TaskStatusAction, {
    action: 'Resolve',
    description: 'Work on task are complete, but verification are required'
  })
  @Literal(TaskStatus) [TaskStatus.Resolved]!: any
}

@Enum$(task.enum.TaskPriority)
class TTaskPriorityEnum extends TEnum<TaskPriority> {
  @Literal(TaskPriority) [TaskPriority.Blocker]!: any
  @Literal(TaskPriority) [TaskPriority.High]!: any
  @Literal(TaskPriority) [TaskPriority.Medium]!: any
  @Literal(TaskPriority) [TaskPriority.Low]!: any
}

@Enum$(task.enum.TaskType)
class TTaskTypeEnum extends TEnum<TaskType> {
  @Literal(TaskType) [TaskType.Task]!: any
  @Literal(TaskType) [TaskType.Defect]!: any
  @Literal(TaskType) [TaskType.Issue]!: any
}

export function model (S: Builder): void {
  S.add(TTask, TTaskLabel, TTaskLink, TTaskStatusAction, TTaskStatusEnum, TTaskPriorityEnum, TTaskTypeEnum)
  S.add(TTypeTask, TPrioritizedTask, TVersionedTask, TTimeManagedTask)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'tasks',
    label: 'Tasks' as IntlString,
    icon: task.icon.Task,
    component: workbench.component.Application,
    classes: [task.class.Task],
    supportSpaces: true,
    spaceTitle: 'Project'
  }, task.application.Task)

  S.mixin(task.class.Task, presentation.mixin.DetailForm, {
    component: task.component.TaskProperties
  })

  S.mixin(task.class.Task, presentation.mixin.CreateForm, {
    component: task.component.CreateTask
  })

  S.createDocument(workbench.class.ItemCreator, {
    app: task.application.Task,
    class: task.class.Task,
    name: 'Task' as IntlString
  })

  S.mixin(task.class.Task, chunter.mixin.ActivityInfo, {
    component: task.component.TaskInfo
  })

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: task.class.Task,
    label: 'Card' as IntlString,
    component: task.component.TaskCardPresenter
  })

  S.createDocument(core.class.Space, {
    name: 'My Project',
    description: 'General test project',
    application: task.application.Task,
    isPublic: true, // Available for all
    archived: false,
    spaceKey: 'TSK',
    users: []
  })
}
