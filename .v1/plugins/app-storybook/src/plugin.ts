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

import { Platform } from '@anticrm/platform'
import { CoreService } from '@anticrm/platform-core'

import storybook from '.'
import Storybook from './components/Storybook.vue'

import Persons from './components/Persons.vue'
import Controls from './components/Controls.vue'
import Calendar from './components/Calendar.vue'


console.log('Plugin `app-storybook` loaded')

/*!
 * Anticrm Platform™ Storybook Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform) => {
  console.log('Plugin `app-storybook` started')

  platform.setResource(storybook.component.Storybook, Storybook)
  platform.setResource(storybook.component.Persons, Persons)
  platform.setResource(storybook.component.Controls, Controls)
  platform.setResource(storybook.component.Calendar, Calendar)

  return {}
}
