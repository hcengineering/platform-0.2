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

import core from '@anticrm/platform-core/src/__resources__'
import ui from '../__resources__'

import coreModel from '@anticrm/platform-core/src/__resources__/model'
import { Builder } from '@anticrm/platform-core/src/__resources__/builder'

import uiModel from '../__resources__/model'

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
    const decorator = session.getClass(ui.class.ClassUIDecorator)
  })
})
