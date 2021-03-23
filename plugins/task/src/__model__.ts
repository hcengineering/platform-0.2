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
import _task, {
  PrioritizedTask, Task, TASK_STATUS_OPEN, TaskFieldType, TaskFieldValue, TaskLink, TaskLinkType, TaskTimeDuration,
  TimeManagedTask, TypedTask, VersionedTask, WorkLog
} from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { UX } from '@anticrm/presentation/src/__model__'
import presentation from '@anticrm/presentation'
import workbench from '@anticrm/workbench/src/__model__'
import chunter, { TCollab } from '@anticrm/chunter/src/__model__'
import { DateProperty, MODEL_DOMAIN, Ref, StringProperty } from '@anticrm/core'
import { Space } from '@anticrm/domains'
import { TDoc, TVDoc } from '@anticrm/model/src/__model__'
import contact from '@anticrm/contact/src/__model__'
import { Asset } from '@anticrm/platform-ui'

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
  },
  status: {
    Open: TASK_STATUS_OPEN,
    ReOpened: '' as Ref<TaskFieldValue>,
    InProgress: '' as Ref<TaskFieldValue>,
    UnderReview: '' as Ref<TaskFieldValue>,
    Resolved: '' as Ref<TaskFieldValue>,
    Closed: '' as Ref<TaskFieldValue>
  }
})

@Class$(task.class.TaskFieldValue, core.class.Doc, MODEL_DOMAIN)
export class TTaskFieldValue extends TDoc implements TaskFieldValue {
  @RefTo$(core.class.Space) _space?: Ref<Space>

  @Prop() type!: TaskFieldType
  @Prop() title!: string
  @Prop() action!: string
  @Prop() description?: string
  @Prop() icon?: Asset
  @Prop() color?: Asset
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
  @RefTo$(task.class.TaskFieldValue) labels!: Ref<TaskFieldValue>[]

  @UX(task.string.Task_status, undefined, task.component.StatusPresenter)
  @ArrayOf$()
  @RefTo$(task.class.TaskFieldValue) status!: Ref<TaskFieldValue>
}

@Mixin$(task.mixin.TypedTask, task.class.Task)
class TTypeTask extends TTask implements TypedTask {
  @UX(task.string.Task_type)
  @ArrayOf$()
  @RefTo$(task.class.TaskFieldValue) type!: Ref<TaskFieldValue>
}

@Mixin$(task.mixin.PrioritizedTask, task.class.Task)
class TPrioritizedTask extends TTask implements PrioritizedTask {
  @UX(task.string.Task_priority)
  @ArrayOf$()
  @RefTo$(task.class.TaskFieldValue) priority!: Ref<TaskFieldValue>
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

export function model (S: Builder): void {
  S.add(TTask, TTaskFieldValue, TTaskLink)
  S.add(TTypeTask, TPrioritizedTask, TVersionedTask, TTimeManagedTask)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'tasks',
    label: 'Tasks' as StringProperty,
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

  S.mixin(task.class.Task, chunter.mixin.ActivityInfo, {
    component: task.component.TaskInfo
  })

  // Define some task default styles
  const statuses = [
    {
      id: task.status.Open,
      title: 'Open',
      action: 'Open',
      description: 'Task is ready to be started',
      color: ''
    },
    {
      id: task.status.Closed,
      title: 'Closed',
      action: 'Close',
      description: 'Task is complete and verified',
      color: 'var(--status-red-color)'
    },
    {
      id: task.status.InProgress,
      title: 'In progress',
      action: 'Start progress',
      description: 'Work on task are started',
      color: 'var(--status-blue-color)'
    },
    {
      id: task.status.UnderReview,
      title: 'Under review',
      action: 'Begin review',
      description: 'Task is being reviewed',
      color: 'var(--status-orange-color)'
    },
    {
      id: task.status.Resolved,
      title: 'Resolved',
      action: 'Resolve',
      description: 'Work on task are complete, but verifcation are required',
      color: 'var(--status-grey-color)'
    }
  ]
  for (const s of statuses) {
    S.createDocument(task.class.TaskFieldValue, {
      type: TaskFieldType.Status,
      title: s.title,
      action: s.action,
      description: s.description,
      color: s.color
    } as TaskFieldValue, s.id)
  }

  S.createDocument(presentation.mixin.Viewlet, {
    displayClass: task.class.Task,
    label: 'Card' as IntlString,
    component: task.component.TaskCardPresenter
  })
}
