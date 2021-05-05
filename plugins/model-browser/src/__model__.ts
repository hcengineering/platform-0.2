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

import { CORE_CLASS_ATTRIBUTE, CORE_CLASS_CLASS } from '@anticrm/core'
import { Builder } from '@anticrm/model'
import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'
import workbench from '@anticrm/workbench/src/__model__'
import modelBrowser from '.'

export function model (S: Builder): void {
  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'ModelBrowser',
    label: 'Model Browser' as IntlString,
    icon: modelBrowser.icon.ModelBrowser,
    rootComponent: modelBrowser.component.ModelBrowser,
    classes: [],
    supportSpaces: false,
    spaceTitle: 'Project'
  }, modelBrowser.application.ModelBrowser)

  S.mixin(CORE_CLASS_CLASS, presentation.mixin.DetailForm, {
    component: modelBrowser.component.ClassProperties
  })
  S.mixin(CORE_CLASS_CLASS, presentation.mixin.Presenter, {
    presenter: presentation.component.StringPresenter
  })
  S.mixin(CORE_CLASS_ATTRIBUTE, presentation.mixin.Presenter, {
    presenter: modelBrowser.component.AttributePresenter
  })
}
