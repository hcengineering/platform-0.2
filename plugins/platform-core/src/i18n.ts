//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { IntlMessageFormat, PrimitiveType } from 'intl-messageformat'

export type IntlStringId = string & { __intl_string: void }

const strings: Map<IntlStringId, string> = new Map()
const imfCache: Map<IntlStringId, IntlMessageFormat> = new Map()

export function translate(string: IntlStringId, params?: Record<string, PrimitiveType> | undefined) {
  const translation = strings.get(string)
  if (!translation) {
    return string
  }
  if (params) {
    let imf = imfCache.get(string)
    if (!imf) {
      imf = new IntlMessageFormat(translation, 'ru-RU')
      imfCache.set(string, imf)
    }
    return imf.format(params)
  }
  return translation
}

export function loadStrings(translations: { [key: string]: string }) {
  for (const key in translations) {
    strings.set(key as IntlStringId, translations[key])
  }
}
