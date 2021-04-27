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

import type { FSM, State } from '.'

// Ideally should be topological sort but need to determine
// what to do with cycles because in general case FSM is not DAG
// This implementation is just a placeholder to get states the same order
// they are defined
export const sortStates = (fsm: FSM): Array<Ref<State>> => {
  return [
    ...new Set<Ref<State>>(
      fsm.transitions.map(({ from, to }) => [from, to])
        .reduce((r, x) => r.concat(x), [])
    )
  ]
}
