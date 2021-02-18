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

import core, { Builder, Class$, extendIds, Prop } from '@anticrm/model'
import { Class, MODEL_DOMAIN, Ref } from '@anticrm/core'
import { Space, VDoc } from '@anticrm/domains'
import { IntlString } from '@anticrm/platform-i18n'

import { TApplication } from '@anticrm/model/src/__model__'
import ux, { UXAttribute } from '@anticrm/presentation'
import { AnyComponent, Asset } from '@anticrm/platform-ui'

import _workbench, { WorkbenchApplication } from '.'

const workbench = extendIds(_workbench, {
  component: {},
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
        label: 'Make a public space' as IntlString,
        presenter: ux.component.CheckboxPresenter
      } as UXAttribute
    }
  })

  S.mixin(core.class.Space, ux.mixin.Presenter, {
    presenter: workbench.component.SpacePresenter
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
    archived: false,
    spaceKey: 'GEN',
    users: []
  }, workbench.space.General)

  S.createDocument(core.class.Space, {
    name: 'Всякое',
    description: 'Other space',
    isPublic: true,
    spaceKey: 'OVR',
    archived: false,
    users: []
  }, workbench.space.Random)

  S.createDocument(core.class.Space, {
    name: 'Разное',
    description: 'Random space',
    isPublic: true,
    spaceKey: 'RAND',
    archived: false,
    users: []
  }, workbench.space.Other)
}
