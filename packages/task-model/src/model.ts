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

import { Class, Property, Ref, Doc, StringProperty } from '@anticrm/platform'
import core, { Builder, ModelClass, ModelMixin, Prop } from '@anticrm/platform-model'
import { UX } from '@anticrm/presentation-model'

import presentation from '@anticrm/presentation-model'
import presentationUI from '@anticrm/presentation-ui'

import workbench from '@anticrm/workbench-model'
import contact from '@anticrm/contact-model'
import task, { TaskDomain } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { Task } from '@anticrm/task'
import { User } from '@anticrm/contact'

import { TVDoc } from '@anticrm/platform-model/src/model'


@ModelClass(task.class.Task, core.class.VDoc, TaskDomain.Task)
@UX('Задача' as IntlString)
class TTask extends TVDoc implements Task {
  @Prop() @UX(task.string.Task_name) title!: Property<string, string>
  @Prop() @UX(task.string.Task_assignee) assignee!: Ref<User>
}

export default (S: Builder) => {

  S.add(TTask)

  // S.createDocument(workbench.class.Application, {
  //   label: 'Задачи' as StringProperty,
  //   icon: task.icon.Task,
  //   main: presentationUI.component.BrowseView,
  //   appClass: task.class.Task
  // }, task.application.Task)

  S.mixin(task.class.Task as Ref<Class<Task>>, presentation.class.DetailForm, {
    component: task.component.View
  })

  S.createDocument(workbench.class.WorkbenchCreateItem, {
    label: 'Задачи / Новая задача' as StringProperty,
    icon: task.icon.Task,
    itemClass: task.class.Task
  })
}
