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

import { Ref, Class, Obj, Type } from '@anticrm/core'
import { Platform } from '@anticrm/platform'
import { getContext } from 'svelte'
import core, { CoreService } from '@anticrm/platform-core'
import { UIService, CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI, AnyComponent } from '@anticrm/platform-ui'
import presentation, { PresentationService, ClassModel, GroupModel, AttrModel } from '.'
import { IntlString } from '@anticrm/platform-i18n'

export function getPlatform (): Platform {
  return getContext(CONTEXT_PLATFORM) as Platform
}

export function getCoreService (): Promise<CoreService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(core.id)
}
export function _getCoreService (): CoreService {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getRunningPlugin(core.id)
}

export function getUIService (): UIService {
  return getContext(CONTEXT_PLATFORM_UI) as UIService
}

export function getPresentationService (): Promise<PresentationService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(presentation.id)
}


export function getEmptyModel (): ClassModel {
  return {
    getGroups (): GroupModel[] { return [] },
    getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined { return undefined }, // eslint-disable-line
    getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[] { return [] }, // eslint-disable-line
    getAttributes (): AttrModel[] { return [] },
    getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined { return undefined }, // eslint-disable-line
    filterAttributes (keys: string[]): ClassModel { return this }, // eslint-disable-line
    getPrimary (): AttrModel | undefined { return undefined },
    filterPrimary (): { model: ClassModel, primary: AttrModel | undefined } { return { model: this, primary: undefined } }
  }
}

export function getEmptyAttribute (_class: Ref<Class<Obj>>): AttrModel {
  return {
    _class,
    key: 'non-existent',
    label: 'Несуществующий аттрибут' as IntlString,
    placeholder: '' as IntlString,
    presenter: 'component:ui.StringPresenter' as AnyComponent,
    type: {} as Type,
    primary: false
  }
}
