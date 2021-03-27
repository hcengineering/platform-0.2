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

import { Class, Doc, Emb, Ref } from '../classes'
import { generateId } from '../storage'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const data = require('./model.json')

export interface HabitComment extends Emb {
  _id: string
  message: string
  author: string
  date: Date
  oldVersion: HabitComment[]
}

export interface SubHabit extends Emb {
  name: string
  rate?: number
  comments?: HabitComment[]
}

export interface Habit extends Doc {
  name: string
  description: string
  lists: string[]
  habits?: SubHabit[]
  mainHabit?: SubHabit
  rate?: number
  comments?: HabitComment[]
}

export const habitIds = {
  class: {
    Habit: 'core.class.HabitObj' as Ref<Class<Habit>>,
    Subhabit: 'core.class.SubHabit' as Ref<Class<SubHabit>>,
    HabitComment: 'core.class.HabitComment' as Ref<Class<HabitComment>>
  }
}

export function createSubhabit (name: string, rate = 30): SubHabit {
  return {
    name: name,
    rate: rate,
    __embedded: true,
    _class: habitIds.class.Subhabit
  } as SubHabit
}

/**
 * Create a random habit with name specified
 * @param name
 */
export function createHabit (name: string, rate: number, description: string): Habit {
  return {
    _id: generateId() as Ref<Doc>,
    _class: habitIds.class.Habit,
    name,
    description,
    lists: [name],
    rate
  } as Habit
}

export const doc1 = {
  _id: 'd1' as Ref<Doc>,
  _class: habitIds.class.Habit,
  name: 'my-space',
  description: 'some-value',
  lists: ['val1', 'val2'],
  rate: 20,
  mainHabit: createSubhabit('main-subhabit', 30),
  habits: [
    createSubhabit('subhabit1', 31),
    createSubhabit('subhabit2', 33)
  ]
} as Habit
