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
import contact from '../__model__'

import coreModel from '@anticrm/platform-core/src/__model__/model'
import i18nModel from '@anticrm/platform-core-i18n/src/__model__/model'
import uiModel from '@anticrm/platform-ui/src/__model__/model'
import contactModel from '@anticrm/contact/src/__model__/model'

import Builder from '@anticrm/platform-core/src/__model__/builder'

describe('core', () => {
  const platform = new Platform()
  platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
  platform.addLocation(i18n, () => import('@anticrm/platform-core-i18n/src/plugin'))

  it('should load model', async () => {
    const builder = new Builder()
    builder.load(coreModel)
    builder.load(i18nModel)
    builder.load(uiModel)
    builder.load(contactModel)
    platform.setMetadata(core.metadata.MetaModel, builder.dump())
    console.log(JSON.stringify(builder.dump()))
  })

  it('should resolve form for persons', async () => {
    const coreService = await platform.getPlugin(core.id)
    const i18nService = await platform.getPlugin(i18n.id)

    const obj = await coreService.getInstance(contact.class.Person)
    expect(coreService.is(obj, ui.class.Form)).toBe(true)
    expect(coreService.as(obj, ui.class.Form).form).toBe(contact.form.Person)
    const clazz = await obj._class
    expect(true).toBe(true)
  })

})
