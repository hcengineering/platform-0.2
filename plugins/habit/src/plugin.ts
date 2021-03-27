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

import type { Platform } from '@anticrm/platform'
import habit, { HabitService } from '.'

import HabitProperties from './components/internal/HabitProperties.svelte'
import HabitInfo from './components/internal/HabitInfo.svelte'
import CreateForm from './components/internal/NewHabitForm.svelte'
import HabitCardPresenter from './components/internal/HabitCardPresenter.svelte'
import StatusPresenter from './components/internal/presenters/StatusPresenter.svelte'

/*!
 * Anticrm Platform™ Habit Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default (platform: Platform): Promise<HabitService> => {
  platform.setResource(habit.component.HabitProperties, HabitProperties)
  platform.setResource(habit.component.HabitInfo, HabitInfo)
  platform.setResource(habit.component.CreateHabit, CreateForm)
  platform.setResource(habit.component.HabitCardPresenter, HabitCardPresenter)
  platform.setResource(habit.component.StatusPresenter, StatusPresenter)

  return Promise.resolve({})
}
