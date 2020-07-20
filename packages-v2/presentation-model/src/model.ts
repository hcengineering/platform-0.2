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

import { UIBuilder } from './builder'
import core from '@anticrm/platform-model'
import ui from '.'

export default (S: UIBuilder) => {
  S.createClass(ui.class.AttributeUI, core.class.Attribute, {
    label: S.attr(core.class.Type, {}),
    placeholder: S.attr(core.class.Type, {}),
    icon: S.attr(core.class.Type, {})
  })

  S.createMixin(ui.class.DetailsForm, core.class.Class, {
    form: S.attr(core.class.Type, {})
  })
}
