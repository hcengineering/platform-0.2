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

import core, { Class$, Prop, ArrayOf$, Builder, InstanceOf$, Primary } from '..'
import { MODEL_DOMAIN } from '@anticrm/core'
import { TAttribute, TClass, TClassifier, TDoc, TEmb, TMixin, TObj, TType, TTitle, TVShortID } from '../__model__'
import { habitIds, SubHabit, Habit, HabitComment } from '@anticrm/core/src/__tests__/habits'

@Class$(habitIds.class.Habit, core.class.Doc, MODEL_DOMAIN)
export class THabit extends TDoc implements Habit {
  @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @Prop() rate!: number

  @Prop() lists!: string[]

  @InstanceOf$(habitIds.class.Subhabit) mainHabit!: SubHabit

  @ArrayOf$()
  @InstanceOf$(habitIds.class.Subhabit)
  habits?: SubHabit[]

  @ArrayOf$()
  @InstanceOf$(habitIds.class.HabitComment)
  comments?: HabitComment[]
}

@Class$(habitIds.class.Subhabit, core.class.Emb, MODEL_DOMAIN)
export class TSubHabit extends TEmb implements SubHabit {
  @Prop() name!: string
  @Prop() rate!: number

  @ArrayOf$()
  @InstanceOf$(habitIds.class.HabitComment)
  comments?: HabitComment[]
}

@Class$(habitIds.class.HabitComment, core.class.Emb, MODEL_DOMAIN)
export class THabitComment extends TEmb implements HabitComment {
  @Prop()
  _id!: string

  @Prop()
  message!: string

  @Prop()
  author!: string

  @Prop()
  date!: Date

  @ArrayOf$()
  @InstanceOf$(habitIds.class.HabitComment)
  oldVersion!: HabitComment[]
}

export function model (S: Builder): void {
  S.add(THabit, TSubHabit, THabitComment)
}

export function fullModelHabit (S: Builder): void {
  S.add(TObj, TEmb, TDoc, TClassifier, TClass, TAttribute, TType, TMixin, TTitle, TVShortID)
  model(S)
}
