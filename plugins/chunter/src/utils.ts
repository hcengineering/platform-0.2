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

import { Ref, Class, Doc, AnyLayout, Mixin, Obj } from '@anticrm/model'
import { Platform } from '@anticrm/platform'
import { getContext } from 'svelte'
import core, { CoreService } from '@anticrm/platform-core'
import contact, { ContactService } from '@anticrm/contact'
import { UIService, CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI, AnyComponent } from '@anticrm/platform-ui'
import presentation, { PresentationService, ComponentExtension } from '@anticrm/presentation'
import chunter, { ChunterService } from '.'
import { VDoc } from '@anticrm/core'

export function getPlatform (): Platform {
  return getContext(CONTEXT_PLATFORM) as Platform
}

export function getUIService (): UIService {
  return getContext(CONTEXT_PLATFORM_UI) as UIService
}

export function getCoreService (): Promise<CoreService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(core.id)
}

export function getContactService (): Promise<ContactService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(contact.id)
}

export function getChunterService (): Promise<ChunterService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(chunter.id)
}

export function find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
  return getCoreService().then(coreService => coreService.find(_class, query))
}

export function findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
  return getCoreService().then(coreService => coreService.findOne(_class, query))
}

export function query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout, f: (docs: T[]) => void): () => void {
  const unsubscriber = getCoreService()
    .then((service) => service.query(_class, query))
    .then((queryResult) => queryResult.subscribe(f))
  return async () => {
    (await unsubscriber)()
  }
}

export function getPresentationService (): Promise<PresentationService> {
  const platform = getContext(CONTEXT_PLATFORM) as Platform
  return platform.getPlugin(presentation.id)
}

export function getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): Promise<AnyComponent> {
  return getPresentationService().then(service => service.getComponentExtension(_class, extension))
}
