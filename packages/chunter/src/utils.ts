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

import { CoreService } from '@anticrm/platform-core'
import { PresentationCore } from '@anticrm/presentation-core'
import { inject } from 'vue'
import { ContactService } from '@anticrm/contact'

export const CoreInjectionKey = 'core-injection-key'
export const PresentationCoreInjectionKey = 'presentation-core-injection-key'
export const ContactServiceInjectionKey = 'contact-injection-key'

export function getCoreService (): CoreService {
  return inject(CoreInjectionKey) as CoreService
}

export function getPresentationCore (): PresentationCore {
  return inject(PresentationCoreInjectionKey) as PresentationCore
}

export function getContactService (): ContactService {
  return inject(ContactServiceInjectionKey) as ContactService
}
