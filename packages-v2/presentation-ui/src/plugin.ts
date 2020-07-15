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
import { PresentationCore } from '@anticrm/presentation-core'
import { UIService } from '@anticrm/platform-ui'

import { PresentationCoreInjectionKey } from './utils'
import { PresentationUI } from '.'

/*!
 * Anticrm Platform™ Presentation Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { ui: UIService, presentationCore: PresentationCore }): Promise<PresentationUI> => {

  deps.ui.getApp().provide(PresentationCoreInjectionKey, deps.presentationCore)

  return {

  }
}