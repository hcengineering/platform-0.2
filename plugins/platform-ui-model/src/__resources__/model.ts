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

import core from '@anticrm/platform-core/src/__resources__'
import i18n from '@anticrm/platform-core-i18n/src/__resources__'
import ui from '.'

import CoreBuilder from '@anticrm/platform-core/src/__resources__/builder'
import { Class, Doc, Ref } from '@anticrm/platform-core'

export default async (B: CoreBuilder) => {

  const i18nString = await B.getClass(i18n.class.IntlString)

  return Promise.all([
    B.createStruct(ui.class.UIDecorator, core.class.Emb, {
      label: await i18nString.newInstance({}),
      icon: await B.metadata()
    }),

    B.createStruct(ui.class.TypeUIDecorator, ui.class.UIDecorator, {
      placeholder: await i18nString.newInstance({}),
    }),

    B.createClass(ui.class.ClassUIDecorator, core.class.StructuralFeature, {
      label: await i18nString.newInstance({}),
      icon: await B.metadata(),
      decorators: await B.bag(await B.struct(ui.class.TypeUIDecorator))
    }),

    B.createClass(ui.class.Query, core.class.Doc, {
      clazz: await B.ref(core.class.Class as Ref<Class<Class<Doc>>>),
      exclude: await B.array(await B.string()),
      order: await B.array(await B.string())
    })
  ])

}
