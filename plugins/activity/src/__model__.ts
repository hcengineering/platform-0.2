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

import core, { Builder, Mixin$, Prop } from '@anticrm/model'

import workbench from '@anticrm/workbench/src/__model__'

import { IntlString } from '@anticrm/platform-i18n'
import { ComponentExtension } from '@anticrm/presentation'
import activity from '.'

import { TMixin } from '@anticrm/model/src/__model__'
import { VDoc } from '@anticrm/domains'

@Mixin$(activity.mixin.ActivityInfo, core.class.Mixin)
class TActivityInfo extends TMixin<VDoc> implements ComponentExtension<VDoc> {
  @Prop() component!: any
}

export function model (S: Builder): void {
  S.add(TActivityInfo)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'activity',
    label: 'Activity' as IntlString,
    icon: activity.icon.ActivityView,
    rootComponent: activity.component.ActivityView,
    classes: [],
    supportSpaces: false
  }, activity.application.Activity)

  S.mixin(core.class.Space, activity.mixin.ActivityInfo, {
    component: activity.component.SpaceInfo
  })
}
