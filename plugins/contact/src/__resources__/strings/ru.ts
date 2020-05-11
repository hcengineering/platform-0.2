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

// import { verifyTranslation } from '@anticrm/platform-core-i18n/src/__resources__/utils'
import { modelTranslation } from '@anticrm/platform-ui/src/__resources__/utils'
import contact from '..'

// export default verifyTranslation(contact.string, {
//   Email: 'Email',
//   Email_placeholder: 'andrey.v.platov@gmail.com',

//   Phone: 'Телефон',
//   Phone_placeholder: '+7 913 333 5555',

//   Twitter: 'Twitter',
//   Twitter_placeholder: '@twitter',

//   Address: 'Адрес',
//   Address_placeholder: 'Новосибирск, Красный проспект, 15',

// })

export default modelTranslation(contact.class, {
  Email: {
    $label: 'Email',
    $placeholder: 'andrey.v.platov@gmail.com'
  },

  // Phone: 'Телефон',
  // Phone_placeholder: '+7 913 333 5555',

  // Twitter: 'Twitter',
  // Twitter_placeholder: '@twitter',

  // Address: 'Адрес',
  // Address_placeholder: 'Новосибирск, Красный проспект, 15',

})