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

import { modelTranslation } from '@anticrm/platform-core-i18n/src/__model__/utils'
import ui from '@anticrm/platform-ui/src/__model__'
import contact from '..'

export default modelTranslation(contact.class, ui.class.ClassUIDecorator, {
  Email: {
    label: 'Email',
    // placeholder: 'andrey.v.platov@gmail.com',
  },
  Phone: {
    label: 'Телефон',
    // placeholder: '+7 913 333 5555'
  },
  Address: {
    label: 'Адрес',
    // placeholder: 'Новосибирск, Красный проспект, 15',
  },
  Contact: {
    label: 'Контактная информация',
    // phoneWork: 'Рабочий',
    // addressDelivery: 'Адрес доставки'
  },
  Person: {
    label: 'Общая информация',
    // firstName: 'Имя',
    // lastName: 'Фамилия',
    // birthDate: 'День рождения'
  }
})