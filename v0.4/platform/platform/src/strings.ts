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

import type { IntlString } from './i18n'
import { addStringsLoader } from './i18n'
import { Platform, defineCode } from './status'

addStringsLoader(Platform, async (lang: string) => {
  switch (lang) {
    case 'en': return await import(`./lang/en.json`) as any
  }
  throw new Error('unsupported language')
})

export default defineCode(Platform, {
  loadingPlugin: '' as IntlString<{ plugin: string }>
})