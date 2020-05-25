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

import { Platform, identify, Plugin, Service, plugin } from '@anticrm/platform'
import { IntlString } from '..'
import { verifyTranslation, modelTranslation } from '../__resources__/utils'

import db from '@anticrm/platform-db'
import core, { Ref, Class, Obj, Doc } from '@anticrm/platform-core'
import i18n from '../__resources__'

interface Person extends Doc {
  first: IntlString
  last: IntlString
  age: number
}

interface PersonWithOrg extends Person {
  org: IntlString
  size: number
}

const test = plugin(
  'test' as Plugin<Service>,
  {},
  {
    person: {
      Vasya: '' as Ref<Person>
    },
    class: {
      PersonWithOrg: '' as Ref<Class<PersonWithOrg>>
    },
    string: {
      MyString: '' as IntlString
    }
  })

const ru = {
  MyString: 'Перевод'
}

describe('i18n', () => {
  const platform = new Platform()
  platform.addLocation(db, () => import('@anticrm/platform-db/src/memdb'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(i18n, () => import('../plugin'))
  // platform.setResolver('native', core.id)

  it('should return original string', async () => {
    const plugin = await platform.getPlugin(i18n.id)
    expect(plugin.translate('does not exists' as IntlString)).toBe('does not exists')
  })

  it('should verify translation', () => {
    const translations = verifyTranslation(test.string, ru)
    expect(translations['string:test.MyString']).toBe(ru.MyString)
  })

  it('should translate simple', async () => {
    const plugin = await platform.getPlugin(i18n.id)
    plugin.loadStrings({
      idSimple: 'Русский'
    })
    expect(plugin.translate('idSimple' as IntlString)).toBe('Русский')
  })

  it('should translate plurals', async () => {
    const plugin = await platform.getPlugin(i18n.id)
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

  it('should translate model', () => {
    const translations = modelTranslation(test.person, test.class.PersonWithOrg, {
      Vasya: {
        first: 'Вася',
        org: 'Organization'
      }
    })
    // console.log(translations)
    expect(translations['string:test.Vasya/first']).toBe('Вася')
    expect(translations['string:test.Vasya/org']).toBe('Organization')
  })
})
