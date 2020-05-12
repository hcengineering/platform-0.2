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

import { IntlString } from '..'

type StringIds = { [key: string]: IntlString }
type AsStrings<T> = { [P in keyof T]: string }

export function verifyTranslation<T extends StringIds>(ids: T, translations: AsStrings<T>): { [key: string]: string } {
  const result = {} as Record<string, string>
  for (const key in ids) {
    const translated = translations[key]
    if (translated) {
      const id = ids[key]
      result[id] = translated
    } else
      throw new Error(`no translation for ${key}`)
  }
  return result as AsStrings<T>
}
