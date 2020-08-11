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

import { Ref } from 'vue'
import { plugin, Plugin, Service } from '@anticrm/platform'

import presentationCore, { ClassModel } from '@anticrm/presentation-core'
import ui, { AnyComponent } from '@anticrm/platform-ui'

export interface PresentationUI extends Service {
  getClassModel (props: { _class: String }, onChange?: (model: ClassModel) => ClassModel): Ref<ClassModel>
}

export default plugin('presentation-ui' as Plugin<PresentationUI>, { ui: ui.id, presentationCore: presentationCore.id }, {

  component: {
    Table: '' as AnyComponent,
    BrowseView: '' as AnyComponent,
    NumberPresenter: '' as AnyComponent,
    StringPresenter: '' as AnyComponent,
    RefPresenter: '' as AnyComponent,
  }
})
