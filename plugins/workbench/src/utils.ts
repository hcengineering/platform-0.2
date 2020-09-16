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

import { Ref, Class, Doc, AnyLayout, Mixin } from '@anticrm/core'
import { Platform } from '@anticrm/platform'
import { getContext } from 'svelte'
import core, { CoreService } from '@anticrm/platform-core'
import { UIService, CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI } from '@anticrm/platform-ui'

export function getCoreService (): Promise<CoreService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(core.id)
}

export function getUIService (): UIService {
  return getContext(CONTEXT_PLATFORM_UI) as UIService
}

export function find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
  return getCoreService().then(coreService => coreService.find(_class, query))
}

export function findCast<T extends Doc> (_class: Ref<Class<Doc>>, query: AnyLayout, mixin: Ref<Mixin<T>>): Promise<T[]> {
  return getCoreService()
    .then(coreService => coreService.find(_class, query)
      .then(docs => coreService.getModel().cast(docs, mixin)))
}
