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

import { Ref, Class, Doc, AnyLayout, Mixin, Obj, VDoc } from '@anticrm/core'
import { Platform } from '@anticrm/platform'
import { getContext } from 'svelte'
import core, { CoreService, QueryResult } from '@anticrm/platform-core'
import { UIService, CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI, AnyComponent } from '@anticrm/platform-ui'
import presentation, { PresentationService, ComponentExtension } from '@anticrm/presentation'

export function getUIService (): UIService {
  return getContext(CONTEXT_PLATFORM_UI) as UIService
}

export function getCoreService (): Promise<CoreService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(core.id)
}

export function _getCoreService (): CoreService {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getRunningPlugin(core.id)
}

export function find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
  return getCoreService().then(coreService => coreService.find(_class, query))
}

export function findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
  return getCoreService().then(coreService => coreService.findOne(_class, query))
}

export function getPresentationService (): Promise<PresentationService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(presentation.id)
}

export function _getPresentationService (): PresentationService {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getRunningPlugin(presentation.id)
}

export function getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): Promise<AnyComponent> {
  return getPresentationService().then(service => service.getComponentExtension(_class, extension))
}

export function query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout, f: (docs: T[]) => void): () => void {
  let unsubscribe: () => void
  function subscribe (queryResult: QueryResult<T>) {
    if (unsubscribe) unsubscribe()
    unsubscribe = queryResult.subscribe(f)
  }
  getCoreService().then(service => service.query(_class, query)).then(queryResult => subscribe(queryResult))
  return () => { unsubscribe() }
}
