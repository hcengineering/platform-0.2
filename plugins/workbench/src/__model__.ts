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

import { TApplication, TDoc } from '@anticrm/model/src/__model__'
import ux from '@anticrm/presentation'
import { AnyComponent, Asset } from '@anticrm/platform-ui'

import _workbench, { ItemCreator, Perspective, WorkbenchApplication } from '.'

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
  @Prop() route!: string
  @Prop() label!: IntlString
  @Prop() icon?: Asset
  @Prop() rootComponent?: AnyComponent
  @Prop() component!: AnyComponent
  @Prop() classes!: Ref<Class<VDoc>>[]

  @Prop() supportSpaces!: boolean
  @Prop() spaceTitle?: string
  @Prop() spaceComponent?: AnyComponent
}

@Class$(workbench.class.Perspective, core.class.Doc, MODEL_DOMAIN)
class TPerspective extends TDoc implements Perspective {
  @Prop() name!: string // A uniq short name
  @Prop() label!: IntlString
  @Prop() icon?: Asset
  @Prop() component!: AnyComponent
}

@Class$(workbench.class.ItemCreator, core.class.Doc, MODEL_DOMAIN)
class TItemCreator extends TDoc implements ItemCreator {
  @Prop() name!: IntlString
  @Prop() class!: Ref<Class<VDoc>>
  @Prop() app!: Ref<Class<WorkbenchApplication>>
  @Prop() component?: AnyComponent
}

export function model (S: Builder): void {
  S.add(TWorkbenchApplication, TPerspective, TItemCreator)

  S.mixin(core.class.Space, ux.mixin.Presenter, {
    presenter: workbench.component.SpacePresenter
  })

  S.createDocument(workbench.class.Perspective, {
    name: 'default',
    label: 'Default' as IntlString,
    icon: workbench.icon.DefaultPerspective,
    component: workbench.component.DefaultPerspective
  }, workbench.perspective.Default)
}
