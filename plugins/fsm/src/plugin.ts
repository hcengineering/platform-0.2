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

import { deepEqual } from 'fast-equals'

import { DateProperty, Doc, Ref, StringProperty } from '@anticrm/core'
import type { Platform } from '@anticrm/platform'
import type { CoreService } from '@anticrm/platform-core'

import BoardPresenter from './presenters/board/BoardPresenter.svelte'
import VDocCardPresenter from './presenters/board/VDocCardPresenter.svelte'

import type { FSM, FSMService, State, Transition } from '.'
import fsmPlugin from '.'

export default async (platform: Platform, deps: {core: CoreService}): Promise<FSMService> => {
  platform.setResource(fsmPlugin.component.BoardPresenter, BoardPresenter)
  platform.setResource(fsmPlugin.component.VDocCardPresenter, VDocCardPresenter)

  const getStates = async (fsm: FSM): Promise<State[]> =>
    await deps.core.find(fsmPlugin.class.State, { fsm: fsm._id as Ref<FSM> })

  const getTransitions = async (fsm: FSM): Promise<Transition[]> =>
    await deps.core.find(fsmPlugin.class.Transition, { fsm: fsm._id as Ref<FSM> })
      .then(xs => xs.filter((x): x is Transition => x !== undefined))

  return {
    getStates,
    getTransitions,
    updateFSM: async (fsm: FSM, transitions: Transition[], states: State[]) => {
      const existingTransitions = await getTransitions(fsm)
      const existingStates = await getStates(fsm)

      const statesDiff = diff(existingStates, states)

      const newStateMap = new Map<Ref<State>, Ref<State>>()

      await Promise.all(statesDiff.removed.map(deps.core.remove.bind(deps.core)))
      await Promise
        .all(statesDiff.added.map(async (x) => [
          x._id,
          await deps.core.create(
            fsmPlugin.class.State,
            {
              _createdOn: Date.now() as DateProperty,
              _createdBy: deps.core.getUserId() as StringProperty,
              _space: fsmPlugin.space.Common,
              name: x.name,
              fsm: fsm._id as Ref<FSM>
            }
          )
        ] as [Ref<State>, State]))
        .then(xs => xs.forEach(([initID, doc]) => newStateMap.set(initID, doc._id as Ref<State>)))
      await Promise.all(statesDiff.modified.map(async (x) => await deps.core.update(x, x)))

      const transitionsDiff = diff(existingTransitions, transitions)

      await Promise.all(transitionsDiff.removed.map(deps.core.remove.bind(deps.core)))
      await Promise.all(transitionsDiff.added
        .map(async t => await deps.core.create(
          fsmPlugin.class.Transition,
          {
            _createdOn: Date.now() as DateProperty,
            _createdBy: deps.core.getUserId() as StringProperty,
            _space: fsmPlugin.space.Common,
            from: newStateMap.get(t.from) ?? t.from,
            to: newStateMap.get(t.to) ?? t.to,
            fsm: fsm._id as Ref<FSM>
          }
        ))
      )
    },
    duplicateFSM: async (fsmRef: Ref<FSM>) => {
      const fsm = await deps.core.findOne(fsmPlugin.class.FSM, { _id: fsmRef })

      if (fsm === undefined) {
        return undefined
      }

      const transitions = await getTransitions(fsm)
      const states = await getStates(fsm)

      const newFSM = await deps.core.create(
        fsmPlugin.class.FSM,
        {
          ...fsm,
          _createdOn: Date.now() as DateProperty,
          _createdBy: deps.core.getUserId() as StringProperty,
          isTemplate: false
        }
      )

      const stateMap = await Promise
        .all(states.map(async state => [
          state,
          await deps.core.create(
            fsmPlugin.class.State,
            {
              ...state,
              _createdOn: Date.now() as DateProperty,
              _createdBy: deps.core.getUserId() as StringProperty,
              fsm: newFSM._id as Ref<FSM>
            }
          )
        ] as [State, State]))
        .then(xs => new Map(xs.map(([x, y]) => [x._id, y._id] as [Ref<State>, Ref<State>])))

      await Promise.all(transitions.map(async transition => await deps.core.create(
        fsmPlugin.class.Transition,
        {
          ...transition,
          _createdOn: Date.now() as DateProperty,
          _createdBy: deps.core.getUserId() as StringProperty,
          fsm: newFSM._id as Ref<FSM>,
          from: stateMap.get(transition.from) ?? '' as Ref<State>,
          to: stateMap.get(transition.to) ?? '' as Ref<State>
        }
      )))

      return newFSM
    }
  }
}

const diff = <T extends Doc>(a: T[], b: T[]): {
  added: T[]
  removed: T[]
  modified: T[]
} => {
  const aIdxs = new Set(a.map(x => x._id))
  const bIdxs = new Set(b.map(x => x._id))

  const added = b.filter(x => !aIdxs.has(x._id))
  const removed = a.filter(x => !bIdxs.has(x._id))
  const modified = b
    .filter(x => aIdxs.has(x._id))
    .filter(x => {
      const aItem = a.find(y => x._id === y._id)

      return aItem !== undefined && !deepEqual(aItem, x)
    })

  return { added, removed, modified }
}
