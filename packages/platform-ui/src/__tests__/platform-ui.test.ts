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

/* eslint-env jest */
import { Platform, plugin, Plugin, Service } from '@anticrm/platform'
import { Ref, Class, Doc, StringType, Type } from '@anticrm/platform-core'
import { ClassUIDecorator, Asset } from '..'
import i18n, { IntlString } from '@anticrm/platform-core-i18n'
import { verifyTranslation, modelTranslation } from '@anticrm/platform-core-i18n/src/__model__/utils'

import core from '@anticrm/platform-core/src/__model__'
import ui from '../__model__/'

import Builder from '@anticrm/platform-core/src/__model__/builder'

import coreModel from '@anticrm/platform-core/src/__model__/model'
import i18nModel from '@anticrm/platform-core-i18n/src/__model__/model'
import uiModel from '@anticrm/platform-ui/src/__model__/model'

describe('session', () => {
  const platform = new Platform()
  platform.addLocation(i18n, () => import('@anticrm/platform-core-i18n/src/plugin'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(ui, () => import('../plugin'))

  const S = new Builder()
  S.load(coreModel)
  S.load(i18nModel)
  S.load(uiModel)
  platform.setMetadata(core.metadata.MetaModel, S.dump())

  interface Contact extends Doc {
    email?: StringType
    phone?: StringType
    phone2?: StringType
    twitter?: StringType
  }

  const contact = plugin(
    'contact' as Plugin<Service>,
    {},
    {
      icon: {
        Email: '' as Asset,
        Phone: '' as Asset
      },
      class: {
        Email: '' as Ref<Class<Type<string>>>,
        Phone: '' as Ref<Class<Type<string>>>,
        Twitter: '' as Ref<Class<Type<string>>>,
        LinkedIn: '' as Ref<Class<Type<string>>>,

        Contact: '' as Ref<Class<Contact>>
      },
      string: {
        PhoneClassLabel: '' as IntlString,
        Phone_Label: '' as IntlString
      }
    })

  it('should load models', async () => {
    const coreServices = await platform.getPlugin(core.id)
    await platform.getPlugin(i18n.id) // TODO: dirty hack, resources does not resolve awhen building prototypes.

    const S = new Builder(coreServices.newSession())

    S.createClass(contact.class.Email, core.class.Type, {})
    S.createClass(contact.class.Phone, core.class.Type, {})
    S.createClass(contact.class.Twitter, core.class.Type, {})

    S.createClass(contact.class.Contact, core.class.Doc, {
      email: S.newInstance(contact.class.Email, {}),
      phone: S.newInstance(contact.class.Phone, {}),
      phone2: S.newInstance(contact.class.Phone, {}),
      twitter: S.newInstance(contact.class.Twitter, {})
    })

    S.mixin(contact.class.Email, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Type<any>>>>, { icon: contact.icon.Email })
    S.mixin(contact.class.Phone, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Type<any>>>>, { label: contact.string.PhoneClassLabel, icon: contact.icon.Phone })
    S.mixin(contact.class.Twitter, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Type<any>>>>, { label: 'Twitter' as IntlString })

    S.mixin(contact.class.Contact, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Contact>>>, {
      decorators: {
        email: S.newInstance(ui.class.TypeUIDecorator, {}),
        phone: S.newInstance(ui.class.TypeUIDecorator, { label: contact.string.Phone_Label, placeholder: '+7 913 333 5555' as any }),
        phone2: S.newInstance(ui.class.TypeUIDecorator, { placeholder: '+1 555 333 5555' as any }),
        twitter: S.newInstance(ui.class.TypeUIDecorator, {})
      }
    })

    platform.setMetadata(contact.icon.Email, 'http://email')
    platform.setMetadata(contact.icon.Phone, 'http://phone')
  })

  it('should build ClassUIModel', async () => {
    await platform.getPlugin(core.id)
    const uiPlugin = await platform.getPlugin(ui.id)
    const classModel = await uiPlugin.getClassModel(contact.class.Contact)
    console.log(classModel)
  })

  it('should build AttrUIModel without strings loaded', async () => {
    const uiPlugin = await platform.getPlugin(ui.id)
    const ownModel = await uiPlugin.getOwnAttrModel(contact.class.Contact)
    expect(ownModel[0].placeholder).toBe('email')
    expect(ownModel[0].label).toBe('email')
    // expect(ownModel[0].icon).toBe('http://email')
    expect(ownModel[0].icon).toBe('icon:contact.Email')
    expect(ownModel[1].placeholder).toBe('+7 913 333 5555')
    expect(ownModel[1].label).toBe('string:contact.Phone_Label')
    expect(ownModel[2].placeholder).toBe('+1 555 333 5555')
    expect(ownModel[2].label).toBe('string:contact.PhoneClassLabel')
    expect(ownModel[3].placeholder).toBe('Twitter')
    expect(ownModel[3].label).toBe('Twitter')
  })

  it('should build AttrUIModel with strings loaded', async () => {
    const i18nPlugin = await platform.getPlugin(i18n.id)
    i18nPlugin.loadStrings(verifyTranslation(contact.string, {
      PhoneClassLabel: 'Тип атрибута Телефон',
      Phone_Label: 'Телефон'
    }))

    const uiPlugin = await platform.getPlugin(ui.id)
    const ownModel = await uiPlugin.getOwnAttrModel(contact.class.Contact)
    expect(ownModel[0].placeholder).toBe('email')
    expect(ownModel[0].label).toBe('email')
    expect(ownModel[1].placeholder).toBe('+7 913 333 5555')
    expect(ownModel[1].label).toBe('Телефон')
    expect(ownModel[2].placeholder).toBe('+1 555 333 5555')
    expect(ownModel[2].label).toBe('Тип атрибута Телефон')
    expect(ownModel[3].placeholder).toBe('Twitter')
    expect(ownModel[3].label).toBe('Twitter')
  })

  it('should build AttrUIModel with model translate', async () => {
    const i18nPlugin = await platform.getPlugin(i18n.id)
    i18nPlugin.loadStrings(verifyTranslation(contact.string, {
      PhoneClassLabel: 'Тип атрибута Телефон',
      Phone_Label: 'Телефон'
    }))
    const translation = modelTranslation(contact.class, ui.class.ClassUIDecorator, {
      Email: {
        label: 'Электронная почта'
      }
    })
    i18nPlugin.loadStrings(translation)

    const uiPlugin = await platform.getPlugin(ui.id)
    const ownModel = await uiPlugin.getOwnAttrModel(contact.class.Contact)
    expect(ownModel[0].placeholder).toBe('Электронная почта')
    expect(ownModel[0].label).toBe('Электронная почта')
    expect(ownModel[1].placeholder).toBe('+7 913 333 5555')
    expect(ownModel[1].label).toBe('Телефон')
    expect(ownModel[2].placeholder).toBe('+1 555 333 5555')
    expect(ownModel[2].label).toBe('Тип атрибута Телефон')
    expect(ownModel[3].placeholder).toBe('Twitter')
    expect(ownModel[3].label).toBe('Twitter')
  })

  it('should add ui decorator to Class<Class>', () => {
    // const typeDecorator = session.getClass(ui.class.TypeUIDecorator)
    // const classClass = session.getClass(core.class.Class)
    // const decoClass = session.mixin(classClass, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Class<Obj>>>>, {
    //   decorators: {
    //     _attributes: typeDecorator.newInstance({ label: 'The Label' as IntlString })
    //   }
    // })
    // expect(decoClass.decorators?._attributes.label).toBe('The Label')
    // expect(decoClass._native).toBe(core.native.Class)
  })
})
