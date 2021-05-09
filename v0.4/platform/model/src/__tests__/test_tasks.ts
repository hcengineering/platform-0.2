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

import { MODEL_DOMAIN } from '@anticrm/core'
import { SubTask, Task, TaskComment, taskIds, TaskMixin } from '@anticrm/core/src/__tests__/tasks'
import core, { ArrayOf$, Builder, Class$, InstanceOf$, Primary, Prop } from '..'
import { Mixin$ } from '../dsl'
import { TDoc, TEmb, model as globalModel } from '../__model__'

@Class$(taskIds.class.Task, core.class.Doc, MODEL_DOMAIN)
export class TTask extends TDoc implements Task {
  @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @Prop() rate!: number

  @ArrayOf$()
  @Prop()
  lists!: string[]

  @InstanceOf$(taskIds.class.Subtask) mainTask!: SubTask

  @ArrayOf$()
  @InstanceOf$(taskIds.class.Subtask)
  tasks?: SubTask[]

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  comments?: TaskComment[]
}

@Class$(taskIds.class.Subtask, core.class.Emb, MODEL_DOMAIN)
export class TSubTask extends TEmb implements SubTask {
  @Prop() name!: string
  @Prop() rate!: number

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  comments?: TaskComment[]
}

@Mixin$(taskIds.mixin.TaskMixin, taskIds.class.Task)
export class TTaskMixin extends TTask implements TaskMixin {
  @Prop() textValue!: string
  @ArrayOf$() listValue!: string[]

  @InstanceOf$(taskIds.class.Subtask) embValue!: TaskComment

  @ArrayOf$()
  @InstanceOf$(taskIds.class.Subtask) embValueList!: TaskComment[]
}

@Class$(taskIds.class.TaskComment, core.class.Emb, MODEL_DOMAIN)
export class TTaskComment extends TEmb implements TaskComment {
  @Prop()
  _id!: string

  @Prop()
  message!: string

  @Prop()
  author!: string

  @Prop()
  date!: Date

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  oldVersion!: TaskComment[]
}

@Class$(taskIds.class.DerivedTask, taskIds.class.Task, MODEL_DOMAIN)
export class TDerivedTask extends TTask {
}

export function model (S: Builder): void {
  S.add(TTask, TDerivedTask, TSubTask, TTaskComment, TTaskMixin)
}

export function fullModel (S: Builder): void {
  globalModel(S)
  model(S)
}
