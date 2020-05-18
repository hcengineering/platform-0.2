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
import db from '@anticrm/platform-db'
import core, { Ref } from '@anticrm/platform-core'
import i18n from '@anticrm/platform-core-i18n'
import launch from '@anticrm/launch-dev'
import contact, { Contact } from '@anticrm/contact'
import uiModel from '../__resources__/'
import ru from '@anticrm/contact/src/__resources__/strings/ru'

describe('session', () => {

  const platform = new Platform()
  platform.addLocation(db, () => import('@anticrm/platform-db/src/memdb'))
  platform.addLocation(i18n, () => import('@anticrm/platform-core-i18n/src/plugin'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(uiModel, () => import('../plugin'))
  platform.addLocation(launch, () => import('@anticrm/launch-dev/src/launch'))
  platform.setResolver('native', core.id)

  const session = platform.getPlugin(launch.id).then(plugin => plugin.session)

  // const clazz = await sess.getClass(contact.class.Contact)
  // const inst = await clazz.newInstance({ _id: 'xxxxddd' as Ref<Contact>, email: 'xxx@gmail.com' })
  // console.log(inst)

  it('should build ClassUIModel', async () => {
    const sess = await session
    const uiPlugin = await platform.getPlugin(uiModel.id)
    const classModel = await uiPlugin.getClassModel(contact.class.Contact)
    // console.log(classModel)
  })

  it('should build AttrUIModel without strings loaded', async () => {
    const uiPlugin = await platform.getPlugin(uiModel.id)
    const ownModel = await uiPlugin.getOwnAttrModel(contact.class.Contact)
    // console.log(ownModel)
    expect(ownModel[0].placeholder).toBe('string:contact.Email/label')
    expect(ownModel[0].label).toBe('string:contact.Email/label')
    expect(ownModel[1].placeholder).toBe('+7 913 333 5555')
    expect(ownModel[2].label).toBe('string:contact.Phone/label')
  })

  it('should build AttrUIModel with strings loaded', async () => {
    const i18nPlugin = await platform.getPlugin(i18n.id)
    i18nPlugin.loadStrings(ru)

    const uiPlugin = await platform.getPlugin(uiModel.id)
    const ownModel = await uiPlugin.getOwnAttrModel(contact.class.Contact)
    // console.log(ownModel)
    expect(ownModel[0].placeholder).toBe('Email')
    expect(ownModel[0].label).toBe('Email')
    expect(ownModel[1].placeholder).toBe('+7 913 333 5555')
    expect(ownModel[2].label).toBe('Телефон')
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
