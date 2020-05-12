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

import { identify, Plugin, PluginId } from '@anticrm/platform'
import { Ref, Class, Obj } from '@anticrm/platform-core'

import { IntlString } from '@anticrm/platform-core-i18n'
import { verifyTranslation } from '@anticrm/platform-core-i18n/src/__resources__/utils'
import { modelTranslation } from '../__resources__/utils'

const ids = identify('test' as PluginId<Plugin>, {
  class: {
    Class: '' as Ref<Class<Class<Obj>>>
  }
})

describe('model', () => {

  it('should translate model', () => {
    const translations = modelTranslation(ids.class, {
      Class: {
        $label: 'Объект',
        toIntlString: 'В строку',
        _attributes: 'Аттрибуты',
        _native: {
          label: 'Имплементация',
          placeholder: 'Placeholder'
        }
      }
    })
    expect(translations['test.class.Class_label']).toBe('Объект')
    expect(translations['test.class.Class.toIntlString_label']).toBe('В строку')
    expect(translations['test.class.Class._attributes_label']).toBe('Аттрибуты')
    expect(translations['test.class.Class._native_label']).toBe('Имплементация')
    expect(translations['test.class.Class._native_placeholder']).toBe('Placeholder')
  })

})
