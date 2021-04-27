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

import type { Ref } from '@anticrm/core'
import type { Platform } from '@anticrm/platform'
import type { CoreService } from '@anticrm/platform-core'

import BoardPresenter from './presenters/board/BoardPresenter.svelte'
import VDocCardPresenter from './presenters/board/VDocCardPresenter.svelte'

import type { FSM, FSMService, State, Transition } from '.'
import fsmPlugin from '.'

export default async (platform: Platform, deps: {core: CoreService}): Promise<FSMService> => {
  platform.setResource(fsmPlugin.component.BoardPresenter, BoardPresenter)
  platform.setResource(fsmPlugin.component.VDocCardPresenter, VDocCardPresenter)

  return {
    getStates: async (fsm: FSM) => {
      const transitions = await Promise
        .all(
          fsm.transitions
            .map(async (_id) => await deps.core.findOne(fsmPlugin.class.Transition, { _id }))
        )
        .then(xs => xs.filter((x): x is Transition => x !== undefined))

      return [
        ...new Set<Ref<State>>(
          transitions.map(({ from, to }) => [from, to])
            .reduce((r, x) => r.concat(x), [])
        )
      ]
    }
  }
}
