//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import platform from '@anticrm/platform'
import startCorePlugin from '@anticrm/platform-core/src/plugin'

import { Class, Obj, Ref, Doc } from '@anticrm/platform-core'
import { ClassUIDecorator } from '@anticrm/platform-ui'

import core from '@anticrm/platform-core/src/__resources__'
import ui from '../__resources__'

import coreModel from '@anticrm/platform-core/src/__resources__/model'
import { Builder } from '@anticrm/platform-core/src/__resources__/builder'

import uiModel from '../__resources__/model'

import { IntlString } from '@anticrm/platform-core-i18n'

describe('session', () => {

  const corePlugin = startCorePlugin(platform)
  const session = corePlugin.getSession()
  coreModel(session)

  const builder = new Builder(session)
  uiModel(builder)

  it('should load ui model', () => {
    const uiDecorator = session.getInstance(ui.class.ClassUIDecorator, core.class.Class)
    expect(uiDecorator._id).toBe(ui.class.ClassUIDecorator)
  })

  it('should add ui decorator to Class<Class>', () => {
    const typeDecorator = session.getStruct(ui.class.TypeUIDecorator)
    const classClass = session.getClass(core.class.Class)
    const decoClass = session.mixin(classClass, ui.class.ClassUIDecorator as Ref<Class<ClassUIDecorator<Class<Obj>>>>, {
      decorators: {
        _attributes: typeDecorator.newInstance({ label: 'The Label' as IntlString })
      }
    })
    expect(decoClass.decorators._attributes.label).toBe('The Label')
    expect(decoClass._native).toBe(core.native.Class)
  })
})
