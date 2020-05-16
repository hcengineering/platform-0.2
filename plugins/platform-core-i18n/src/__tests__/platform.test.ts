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

import { Platform, identify, Plugin, PluginId } from '@anticrm/platform'
import { IntlString } from '..'
import i18nPlugin from '../plugin'
import { verifyTranslation } from '../__resources__/utils'

import db from '@anticrm/platform-db'
import core from '@anticrm/platform-core'
import i18n from '../__resources__'

const ids = identify('test' as PluginId<Plugin>, {
  string: {
    MyString: '' as IntlString
  },
})

const ru = {
  MyString: 'Перевод',
}

describe('i18n', () => {

  const platform = new Platform()
  platform.addLocation(db, () => import('@anticrm/platform-db/src/memdb'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(i18n, () => import('../plugin'))
  platform.setResolver('native', core.id)

  const i18nPlugin = platform.getPlugin(i18n.id)

  it('should return original string', () => {
    i18nPlugin.then(plugin => {
      expect(plugin.translate('does not exists' as IntlString)).toBeUndefined()
    })
  })

  it('should verify translation', () => {
    const translations = verifyTranslation(ids.string, ru)
    expect(translations['string:test.MyString']).toBe(ru.MyString)
  })

  it('should translate simple', () => {
    i18nPlugin.then(plugin => {
      plugin.loadStrings({
        idSimple: 'Русский'
      })
      expect(plugin.translate('idSimple' as IntlString)).toBe('Русский')
    })
  })

  it('should translate plurals', () => {
    i18nPlugin.then(plugin => {
      plugin.loadStrings({
        idPlural: '{count, plural, =1 {секунду} few {# секунды} many {# секунд} other {# секунду} } назад'
      })
      const message = 'idPlural' as IntlString
      expect(plugin.translate(message, { count: 1 })).toBe('секунду назад')
      expect(plugin.translate(message, { count: 2 })).toBe('2 секунды назад')
      expect(plugin.translate(message, { count: 5 })).toBe('5 секунд назад')
      expect(plugin.translate(message, { count: 11 })).toBe('11 секунд назад')
      expect(plugin.translate(message, { count: 21 })).toBe('21 секунду назад')
      expect(plugin.translate(message, { count: 22 })).toBe('22 секунды назад')
      expect(plugin.translate(message, { count: 25 })).toBe('25 секунд назад')
    })
  })
})
