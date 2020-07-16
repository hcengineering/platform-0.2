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

import { inject } from 'vue'
import { CoreService } from '@anticrm/platform-core'
import { UIService } from '@anticrm/platform-ui'
// import { PresentationUI } from '@anticrm/presentation-ui'

export const CoreInjectionKey = 'core-injection-key'
export const UIInjectionKey = 'ui-injection-key'
export const PresentationUIInjectionKey = 'presentation-ui-injection-key'

export function getCoreService(): CoreService {
  return inject(CoreInjectionKey) as CoreService
}

export function getUIService(): UIService {
  return inject(UIInjectionKey) as UIService
}

// export function getPresentationUI(): PresentationUI {
//   return inject(PresentationUIInjectionKey) as PresentationUI
// }
