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

import { extendIds, Class$, Prop, Builder, Primary } from '@anticrm/model'
import _task, { Task } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { User } from '@anticrm/contact'
import { UX } from '@anticrm/presentation/src/__model__'
import presentation from '@anticrm/presentation'
import workbench from '@anticrm/workbench/src/__model__'
import chunter from '@anticrm/chunter/src/__model__'
import core, { Application, Ref, Property, StringProperty } from '@anticrm/core'
import { TVDoc } from '@anticrm/core/src/__model__'

export const DOMAIN_TASK = 'task'

const task = extendIds(_task, {
  application: {
    Task: '' as Ref<Application>
  },
  string: {
    Task_name: '' as IntlString,
    Task_assignee: '' as IntlString
  }
})

export default task

@Class$(task.class.Task, core.class.VDoc, DOMAIN_TASK)
@UX('Задача' as IntlString)
class TTask extends TVDoc implements Task {
  @Primary() @Prop() @UX('Имя' as IntlString) title!: Property<string, string>
  @Prop() @UX(task.string.Task_assignee) assignee!: Ref<User>
}

export function model (S: Builder): void {
  S.add(TTask)

  S.createDocument(workbench.class.WorkbenchApplication, {
    label: 'Задачи' as StringProperty,
    icon: workbench.icon.DefaultPerspective,
    component: workbench.component.Application,
    classes: [task.class.Task]
  }, task.application.Task)

  S.mixin(task.class.Task, presentation.class.DetailForm, {
    component: task.component.TaskProperties
  })

  S.mixin(task.class.Task, chunter.mixin.ActivityInfo, {
    component: task.component.TaskInfo
  })
}
