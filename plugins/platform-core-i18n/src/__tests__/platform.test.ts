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
import { verifyTranslation, modelTranslation } from '../__resources__/utils'

import db from '@anticrm/platform-db'
import core, { Ref, Class, Obj } from '@anticrm/platform-core'
import i18n from '../__resources__'
import contact from '@anticrm/contact/src/__resources__'
import ui from '@anticrm/platform-ui-model/src/__resources__'

const ids = identify('test' as PluginId<Plugin>, {
  string: {
    MyString: '' as IntlString
  },
  class: {
    Class: '' as Ref<Class<Class<Obj>>>
  }
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


  it('should return original string', async () => {
    const plugin = await platform.getPlugin(i18n.id)
    expect(plugin.translate('does not exists' as IntlString)).toBe('does not exists')
  })

  it('should verify translation', () => {
    const translations = verifyTranslation(ids.string, ru)
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
    const translations = modelTranslation(contact.class, ui.class.TypeUIDecorator, {
      Email: {
        label: 'Email',
        placeholder: 'andrey.v.platov@gmail.com',
      },
      Phone: {
        label: 'Телефон',
        placeholder: '+7 913 333 5555'
      },
      Twitter: {
        label: 'Twitter',
        placeholder: '@twitter',
      },
      Address: {
        label: 'Адрес',
        placeholder: 'Новосибирск, Красный проспект, 15',
      },
      Contact: {
        label: 'Контактная информация',
      },
      Person: {
        label: 'Общая информация',
      }
    })
    // console.log(translations)
    expect(translations['string:contact.Email/label']).toBe('Email')
    expect(translations['string:contact.Phone/placeholder']).toBe('+7 913 333 5555')
    expect(translations['string:contact.Contact/label']).toBe('Контактная информация')
  })

})
