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

import { Metadata } from '@anticrm/platform'
import ui, { TypeUIDecorator, UIDecorator } from '..'

import { Ref, Class, Type } from '@anticrm/platform-core'
import { IntlString } from '@anticrm/platform-core-i18n'

import { extendIds } from '@anticrm/platform-core/src/__resources__/utils'

export default extendIds(ui, {
  class: {
    IntlString: '' as Ref<Class<Type<IntlString>>>,

    UIDecorator: '' as Ref<Class<UIDecorator>>,
    TypeUIDecorator: '' as Ref<Class<TypeUIDecorator>>,
  }
})

