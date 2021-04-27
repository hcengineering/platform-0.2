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

import { Platform } from '@anticrm/platform'

import BoardPresenter from './presenters/board/BoardPresenter.svelte'
import VDocCardPresenter from './presenters/board/VDocCardPresenter.svelte'
import type { FSMService } from '.'
import fsm from '.'

export default async (platform: Platform): Promise<FSMService> => {
  platform.setResource(fsm.component.BoardPresenter, BoardPresenter)
  platform.setResource(fsm.component.VDocCardPresenter, VDocCardPresenter)

  return await Promise.resolve({})
}
