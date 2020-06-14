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

import { Platform, Plugin, Service, plugin } from '@anticrm/platform'
import { IntlString } from '..'
import { verifyTranslation, modelTranslation } from '../__model__/utils'

import core from '@anticrm/platform-core/src/__model__'
import i18n from '../__model__'

import { Ref, Class, Obj, Doc, StringType } from '@anticrm/platform-core'

import metaModel, { Builder } from '@anticrm/platform-core/src/__model__/model'
import i18nModel from '../__model__/model'

interface Person extends Doc {
  name?: IntlString
  first: StringType
  last?: StringType
}

interface PersonWithOrg extends Person {
  org: IntlString
}

const test = plugin(
  'test' as Plugin<Service>,
  {},
  {
    person: {
      Vasya: '' as Ref<Person>,
      Petya: '' as Ref<Person>
    },
    class: {
      Person: '' as Ref<Class<Person>>,
      PersonWithOrg: '' as Ref<Class<PersonWithOrg>>
    },
    string: {
      MyString: '' as IntlString,
      Vasya: '' as IntlString
    }
  })

describe('i18n', () => {
  const platform = new Platform()
  // platform.addLocation(db, () => import('@anticrm/platform-db/src/memdb'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(i18n, () => import('../plugin'))
  // platform.setResolver('native', core.id)

  it('should return original string', async () => {
    const plugin = await platform.getPlugin(i18n.id)
    expect(plugin.translate('does not exists' as IntlString)).toBe('does not exists')
  })

  it('should verify translation', () => {
    const translations = verifyTranslation(test.string, test.string)
    expect(translations['string:test.MyString']).toBe(test.string.MyString)
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
        name: 'Вася',
        org: 'Organization'
      }
    })
    // console.log(translations)
    expect(translations['string:test.Vasya/name']).toBe('Вася')
    expect(translations['string:test.Vasya/org']).toBe('Organization')
  })

  // L O C A L  S T R I N G  T Y P E

  it('should ...', async () => {
    // const coreService = await platform.getPlugin(core.id)
    const S = new Builder()
    S.load(metaModel)
    S.load(i18nModel)
    platform.setMetadata(core.metadata.MetaModel, S.dump())
    expect(true).toBe(true)
  })

  it('should translate attribute value', async () => {
    const coreService = await platform.getPlugin(core.id)
    const session = coreService.newSession()
    const S = new Builder(session.getModel())

    const ru = {
      MyString: 'Перевод',
      Vasya: 'Вася'
    }

    const personClass = S.createClass<Person, Doc>(test.class.Person, core.class.Doc, {
      name: S.newInstance(i18n.class.IntlString, {}),
      first: S.newInstance(core.class.Type, {}),
      last: S.newInstance(core.class.Type, {}),
    })

    const person = S.createDocument(test.class.Person, {
      name: test.string.Vasya,
      first: 'first' as StringType
    }, 'vasya' as Ref<Person>)

    const instance = await session.getInstance('vasya' as Ref<Person>)
    console.log(instance)
    expect(instance.name).toBe(test.string.Vasya)

    const i18nService = await platform.getPlugin(i18n.id)
    i18nService.loadStrings(verifyTranslation(test.string, ru))
    expect(instance.name).toBe(ru.Vasya)

    const translations = modelTranslation(test.person, test.class.Person, {
      Petya: {
        name: 'Петя'
      }
    })
    console.log(translations)
    i18nService.loadStrings(translations)

    const petya = S.createDocument(test.class.Person, { first: 'first' as StringType }, 'test.Petya' as Ref<Person>)
    const petyaInstance = await session.getInstance('test.Petya' as Ref<Person>)
    expect(petyaInstance.name).toBe('Петя')
  })
})
