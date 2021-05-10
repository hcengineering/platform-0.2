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

import { Class, DateProperty, Ref, StringProperty } from '@anticrm/core'
import type { Platform } from '@anticrm/platform'
import type { Space, VDoc } from '@anticrm/domains'
import type { CoreService } from '@anticrm/platform-core'

import BoardPresenter from './presenters/board/BoardPresenter.svelte'
import VDocCardPresenter from './presenters/board/VDocCardPresenter.svelte'

import type { FSM, FSMItem, FSMService, State, Transition, WithFSM } from '.'
import fsmPlugin from '.'

export default async (platform: Platform, deps: {core: CoreService}): Promise<FSMService> => {
  platform.setResource(fsmPlugin.component.BoardPresenter, BoardPresenter)
  platform.setResource(fsmPlugin.component.VDocCardPresenter, VDocCardPresenter)

  const getStates = async (fsm: FSM): Promise<State[]> =>
    await deps.core.find(fsmPlugin.class.State, { fsm: fsm._id as Ref<FSM> })

  const getTransitions = async (fsm: FSM): Promise<Transition[]> =>
    await deps.core.find(fsmPlugin.class.Transition, { fsm: fsm._id as Ref<FSM> })
      .then(xs => xs.filter((x): x is Transition => x !== undefined))

  const getTargetFSM = async (fsmOwner: WithFSM): Promise<FSM | undefined> => {
    return await deps.core.findOne(fsmPlugin.class.FSM, { _id: fsmOwner.fsm })
  }

  return {
    getStates,
    getTransitions,
    addStateItem: async <T extends FSMItem>(
      fsmOwner: WithFSM,
      item: {
        _class?: Ref<Class<T>>
        obj: Omit<T, keyof VDoc | 'state' | 'fsm'> & {state?: Ref<State>}
      },
      space?: Ref<Space>
    ) => {
      // TODO: we need to make sure that new FSMItem is only referring to specific item
      const fsm = await getTargetFSM(fsmOwner)

      if (fsm === undefined) {
        return
      }

      const state = item.obj.state ?? (await getStates(fsm))[0]._id as Ref<State>

      return await deps.core.create(item._class ?? fsmPlugin.class.FSMItem, {
        _createdBy: deps.core.getUserId() as StringProperty,
        _createdOn: Date.now() as DateProperty,
        _space: space ?? fsmOwner._id as Ref<Space>,
        ...item.obj,
        fsm: fsmOwner._id as Ref<WithFSM>,
        state
      })
    },
    removeStateItem: async (item: Ref<VDoc>, fsmOwner: WithFSM) => {
      const docs = await deps.core.find(fsmPlugin.class.FSMItem, { item, fsm: fsmOwner._id as Ref<WithFSM> })

      await Promise.all(docs.map(deps.core.remove.bind(deps.core)))
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
