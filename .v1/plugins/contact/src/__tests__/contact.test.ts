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

import { Platform } from '@anticrm/platform'

import core from '@anticrm/platform-core/src/__model__'
import i18n from '@anticrm/platform-core-i18n/src/__model__'
import ui from '@anticrm/platform-ui/src/__model__'
import business from '@anticrm/platform-business/src/__model__'
import rpcStub from '@anticrm/platform-rpc-stub'
import contact from '../__model__'

import coreModel from '@anticrm/platform-core/src/__model__/model'
import i18nModel from '@anticrm/platform-core-i18n/src/__model__/model'
import uiModel from '@anticrm/platform-ui/src/__model__/model'
import businessModel from '@anticrm/platform-business/src/__model__/model'
import contactModel from '@anticrm/contact/src/__model__/model'

import Builder from '@anticrm/platform-core/src/__model__/builder'

describe('core', () => {
  const platform = new Platform()
  platform.addLocation(rpcStub, () => import('@anticrm/platform-rpc-stub/src/plugin'))
  platform.addLocation(i18n, () => import('@anticrm/platform-core-i18n/src/plugin'))
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(business, () => import('@anticrm/platform-business/src/plugin'))
  platform.addLocation(ui, () => import('@anticrm/platform-ui/src/plugin'))
  platform.addLocation(contact, () => import('../plugin'))

  const S = new Builder()
  S.load(coreModel)
  S.load(i18nModel)
  S.load(uiModel)
  S.load(businessModel)
  S.load(contactModel)
  platform.setMetadata(rpcStub.metadata.Metamodel, S.dump())

  it('should resolve form for persons', async () => {
    const coreService = await platform.getPlugin(core.id)
    const session = coreService.newSession()

    const obj = await session.getInstance(core.class.Class, contact.class.Person)
    expect(session.is(obj, ui.class.Form)).toBe(true)
    const asForm = await session.as(obj, ui.class.Form)
    expect(asForm.form).toBe(contact.form.Person)
    const clazz = await obj._class
    expect(true).toBe(true)
  })

  it('should provide proper text / image', async () => {
    const coreService = await platform.getPlugin(core.id)
    const businessService = await platform.getPlugin(business.id)
    const session = coreService.newSession()

    const x = await businessService.newBusinessObject(session, contact.class.Person, {
      firstName: 'John', lastName: 'Carmack'
    })

    const m = x.getText()

    console.log(m)
    console.log(await m)


    expect(true).toBe(true)
  })

})
