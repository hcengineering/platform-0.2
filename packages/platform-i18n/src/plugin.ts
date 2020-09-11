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
import i18n, { I18n, IntlString } from '.'
import { IntlMessageFormat, PrimitiveType } from 'intl-messageformat'

/*!
 * Anticrm Platform™ Internationalization Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<I18n> => {
  const strings: Map<IntlString, string> = new Map()
  const imfCache: Map<IntlString, IntlMessageFormat> = new Map()

  function loadStrings (translations: { [key: string]: string }) {
    for (const key in translations) {
      strings.set(key as IntlString, translations[key])
    }
  }

  async function translate (string: IntlString, params?: Record<string, PrimitiveType> | undefined): Promise<string> {
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
      return imf.format(params) as string
    }
    return translation
  }

  const meta = platform.getMetadata(i18n.metadata.Strings)
  if (meta) {
    console.log(meta)
    loadStrings(meta)
  }

  return {
    loadStrings,
    translate
  }
}
