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

import { IntlString } from '../../platform'
import { Ref, Class, Obj } from '../../types'
import { verifyTranslation, modelTranslation } from '../utils'
import id from '../../id'

const ids = id('test', {
  strings: {
    MyString: '' as IntlString
  },
  class: {
    Object: '' as Ref<Class<Obj>>
  }
})

const ru = {
  MyString: 'Перевод'
}

describe('model', () => {

  it('should verify translation', () => {
    const translations = verifyTranslation(ids.strings, ru)
    expect(translations['test.strings.MyString']).toBe(ru.MyString)
  })

  it('should translate model', () => {
    const translations = modelTranslation(ids.class, {
      Object: {
        $label: 'Объект',
        toIntlString: 'В строку'
      }
    })
    expect(translations['test.class.Object']).toBe('Объект')
    expect(translations['test.class.Object.toIntlString']).toBe('В строку')
  })

})
