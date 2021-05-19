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

import core, { Collection, MODEL_DOMAIN } from '@anticrm/core'
import { Task, TaskComment, TaskEstimate, taskIds, TaskMixin } from '@anticrm/core/src/__tests__/tasks'
import { Builder, Class$, CollectionOf$, InstanceOf$, Mixin$, Prop } from '@anticrm/model'
import { TDoc, TEmb } from '..'

@Class$(taskIds.class.Task, core.class.Doc, MODEL_DOMAIN)
export class TTask extends TDoc implements Task {
  // @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @Prop() rate!: number

  @CollectionOf$(taskIds.class.TaskComment)
  comments?: Collection<TaskComment>

  @InstanceOf$(taskIds.class.TaskEstimate) eta!: TaskEstimate
}

@Mixin$(taskIds.mixin.TaskMixin, taskIds.class.Task)
export class TTaskMixin extends TTask implements TaskMixin {
  @Prop() textValue!: string
}

@Class$(taskIds.class.TaskComment, core.class.Emb, MODEL_DOMAIN)
export class TTaskComment extends TEmb implements TaskComment {
  @Prop()
  message!: string

  @Prop()
  author!: string

  @Prop()
  date!: Date
}

@Class$(taskIds.class.TaskEstimate, core.class.Emb, MODEL_DOMAIN)
export class TTaskEstimate extends TEmb implements TaskEstimate {
  @Prop() rom!: number // in hours
  @Prop() eta!: number // in hours
}

export function model (S: Builder): void {
  S.add(TTask, TTaskComment, TTaskMixin, TTaskEstimate)
}
