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

import presentation, { UIBuilder } from '@anticrm/presentation-model'
import presentationUI from '@anticrm/presentation-ui'


import core from '@anticrm/platform-model'
import workbench from '@anticrm/workbench-model'
import contact from '@anticrm/contact-model'
import task, { TaskDomain } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { Task } from '@anticrm/task'


export default (S: UIBuilder) => {

  S.createDocument(workbench.class.Application, {
    label: 'Задачи' as StringProperty,
    icon: task.icon.Task,
    main: presentationUI.component.BrowseView,
    appClass: task.class.Task
  }, task.application.Task)

  S.createClassUI(task.class.Task, core.class.VDoc, {
    _domain: TaskDomain.Task as Property<string, string>,
    label: 'Задача' as IntlString
  }, {
    title: S.attrUI(core.class.Type, {}, {
      label: task.string.Task_name
    }),
    assignee: S.attrUI(core.class.RefTo, {
      to: contact.mixin.User as Ref<Class<Doc>> // TODO: fix types
    }, {
      label: task.string.Task_assignee
    }),
  })

  S.mixin(task.class.Task as Ref<Class<Task>>, presentation.class.DetailForm, {
    component: task.component.View
  })

  S.createDocument(workbench.class.WorkbenchCreateItem, {
    label: 'Задачи / Новая задача' as StringProperty,
    icon: task.icon.Task,
    itemClass: task.class.Task
  })
}
