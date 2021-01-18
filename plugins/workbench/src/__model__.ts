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

import { Ref, MODEL_DOMAIN, Class, Builder, extendIds, Class$, Prop } from '@anticrm/model'
import core, { Space, VDoc } from '@anticrm/core'
import { IntlString } from '@anticrm/platform-i18n'

import { TApplication } from '@anticrm/core/src/__model__'
import ux, { UXAttribute } from '@anticrm/presentation'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import chunter from '@anticrm/chunter'

import _workbench, { Perspective, WorkbenchApplication } from '.'

const workbench = extendIds(_workbench, {
  component: {
  },
  perspective: {
    Default: '' as Ref<Perspective>
  },
  space: {
    General: '' as Ref<Space>,
    Random: '' as Ref<Space>,
    Other: '' as Ref<Space>
  }
})

export default workbench

@Class$(workbench.class.WorkbenchApplication, core.class.Application, MODEL_DOMAIN)
class TWorkbenchApplication extends TApplication implements WorkbenchApplication {
  @Prop() label!: IntlString
  @Prop() icon?: Asset
  @Prop() component!: AnyComponent
  @Prop() classes!: Ref<Class<VDoc>>[]
}

export function model (S: Builder): void {
  S.add(TWorkbenchApplication)

  S.mixin(core.class.Space, ux.mixin.UXObject, {
    label: 'Space' as IntlString,
    attributes: {
      name: {
        label: 'Title' as IntlString
      } as UXAttribute,
      users: {
        label: 'Members' as IntlString
      } as UXAttribute,
      isPublic: {
        label: 'Make space public' as IntlString,
        presenter: ux.component.CheckboxPresenter
      } as UXAttribute,
      autoJoin: {
        label: 'Auto join(for public space)' as IntlString,
        presenter: ux.component.CheckboxPresenter
      } as UXAttribute
    }
  })

  S.createClass(workbench.class.Perspective, core.class.Doc, {
    label: S.attr(core.class.String, {}),
    icon: S.attr(core.class.Type, {}),
    component: S.attr(core.class.Type, {})
  }, MODEL_DOMAIN)

  S.createDocument(workbench.class.Perspective, {
    label: 'Default' as IntlString,
    icon: workbench.icon.DefaultPerspective,
    component: workbench.component.DefaultPerspective
  }, workbench.perspective.Default)

  S.createDocument(core.class.Space, {
    name: 'Общее',
    description: 'General space',
    isPublic: true, // Available for all
    autoJoin: true,
    users: []
  }, workbench.space.General)

  S.createDocument(core.class.Space, {
    name: 'Всякое',
    description: 'Other space',
    isPublic: true,
    autoJoin: true,
    users: []
  }, workbench.space.Random)

  S.createDocument(core.class.Space, {
    name: 'Разное',
    description: 'Random space',
    isPublic: true,
    autoJoin: false,
    users: []
  }, workbench.space.Other)

  S.createDocument(workbench.class.WorkbenchApplication, {
    label: 'Активность' as IntlString,
    icon: workbench.icon.DefaultPerspective,
    component: chunter.component.ActivityView,
    classes: []
  }, workbench.application.Activity)

  S.createDocument(workbench.class.WorkbenchApplication, {
    label: 'Чат' as IntlString,
    icon: workbench.icon.DefaultPerspective,
    component: chunter.component.ChatView,
    classes: []
  }, workbench.application.Chat)
}
