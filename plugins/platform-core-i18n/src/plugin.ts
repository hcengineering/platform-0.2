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

import { IntlMessageFormat, PrimitiveType } from 'intl-messageformat'
import { Platform } from '@anticrm/platform'
import { Doc, Obj, Type, Ref, Class, Session, PropertyType, CorePlugin } from '@anticrm/platform-core'
import i18n, { I18nPlugin, IntlString, pluginId } from '..'

// export function synthIntlStringId(clazz: Ref<Class<Obj>>, propertyKey: string, attribute?: string): IntlString {
//   return (attribute ? clazz + '.' + attribute + '_' + propertyKey : clazz + '_' + propertyKey) as IntlString
// }

export function synthIntlString(_id: Ref<Doc>, key: string): IntlString {
  const index = _id.indexOf(':')
  const kind = _id.substring(0, index)
  if (kind !== 'class')
    throw new Error('hmm, do we have a case?')
  const keyIndex = key.indexOf('/')
  if (keyIndex !== -1) {
    key = key.substring(keyIndex + 1)
  }
  return 'string' + _id.substring(index) + '/' + key as IntlString
}

console.log('PLUGIN: parsed i18n')
export default async (platform: Platform, deps: { core: CorePlugin }): Promise<I18nPlugin> => {

  /*!
   * Anticrm Platform™ Core Internationalization Plugin
   * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
   * Licensed under the Eclipse Public License, Version 2.0
   */

  console.log('PLUGIN: started i18n')

  class I18nPluginImpl implements I18nPlugin {
    readonly pluginId = pluginId
    readonly platform: Platform

    private strings: Map<IntlString, string> = new Map()
    private imfCache: Map<IntlString, IntlMessageFormat> = new Map()

    constructor(platform: Platform) { this.platform = platform }

    translate(string: IntlString, params?: Record<string, PrimitiveType> | undefined): string | undefined {
      const translation = this.strings.get(string)
      if (!translation) {
        return string
      }
      if (params) {
        let imf = this.imfCache.get(string)
        if (!imf) {
          imf = new IntlMessageFormat(translation, 'ru-RU')
          this.imfCache.set(string, imf)
        }
        return imf.format(params) as string
      }
      return translation
    }

    loadStrings(translations: { [key: string]: string }) {
      for (const key in translations) {
        this.strings.set(key as IntlString, translations[key])
      }
    }
  }

  const plugin = new I18nPluginImpl(platform)

  abstract class TIntlString implements Type<IntlString> {
    _class!: Ref<Class<this>>
    abstract getSession(): Session
    abstract getClass(): Class<this>
    abstract toIntlString(plural?: number | undefined): string

    exert(value: IntlString, target?: any, key?: string): any {
      if (value === undefined) {
        if (target?._id && key) {
          const id = target._id as Ref<Doc>
          const intl = synthIntlString(id, key)
          return plugin.translate(intl)
        }
      }
      return value
    }
    hibernate(value: any): IntlString { return value }
  }

  deps.core.registerPrototype(i18n.native.IntlString, TIntlString.prototype)

  return plugin
}
