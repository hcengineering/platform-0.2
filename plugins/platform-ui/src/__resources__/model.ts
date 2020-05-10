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

import core from '@anticrm/platform-core/src/__resources__'
import ui from '.'

import { Builder } from '@anticrm/platform-core/src/__resources__/builder'

export default (B: Builder) => {
  const i18n = B.createStruct(ui.class.IntlString, core.class.Type, {})

  B.createStruct(ui.class.UIDecorator, core.class.Emb, {
    label: i18n.newInstance({}),
    icon: B.meta()
  })

  B.createStruct(ui.class.TypeUIDecorator, ui.class.UIDecorator, {
    placeholder: i18n.newInstance({}),
  })

  B.createClass(ui.class.ClassUIDecorator, core.class.StructuralFeature, {
    label: i18n.newInstance({}),
    icon: B.meta(),
    decorators: B.bag(B.struct(ui.class.TypeUIDecorator))
  })

}
