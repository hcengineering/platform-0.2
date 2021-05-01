//
// Copyright © 2020-2021 Anticrm Platform Contributors.
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

import { Class, CORE_CLASS_TYPE, Doc, DocumentQuery, FindOptions, Mixin, Obj, Ref, StringProperty } from '@anticrm/core'
import { getContext, onDestroy } from 'svelte'
import core, { CoreService, QueryUpdater, Unsubscribe } from '@anticrm/platform-core'
import { AnyComponent, CONTEXT_PLATFORM } from '@anticrm/platform-ui'
import presentationPlugin, { AttrModel, ClassModel, ComponentExtension, GroupModel, PresentationService } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { VDoc } from '@anticrm/domains'

import { deepEqual } from 'fast-equals'
import { Platform } from '@anticrm/platform'

export async function getCoreService (): Promise<CoreService> {
  const platform = getContext<Platform>(CONTEXT_PLATFORM)
  return await platform.getPlugin(core.id)
}

export async function getPresentationService (): Promise<PresentationService> {
  const platform = getContext<Platform>(CONTEXT_PLATFORM)
  return await platform.getPlugin(presentationPlugin.id)
}

export async function getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): Promise<AnyComponent | undefined> {
  return await getPresentationService().then(service => service.getComponentExtension(_class, extension))
}

export function getUserId (): string {
  const platform = getContext<Platform>(CONTEXT_PLATFORM)
  return platform.getMetadata(core.metadata.WhoAmI) as StringProperty
}

/**
 * Perform subscribe to query with some helper finalizer to use
 * @param _class - a class to perform search against
 * @param _query - a query to match object.
 * @param action - callback with list of results.
 * @return a function to re-query with a new parameters for same action.
 */
export async function createLiveQuery<T extends Doc> (_class: Ref<Class<T>>, _query: DocumentQuery<T>,
  action: (docs: T[]) => void, options?: FindOptions<T>): Promise<QueryUpdater<T>> {
  let oldQuery: DocumentQuery<T>
  let oldClass: Ref<Class<T>>
  let oldOptions: FindOptions<T> | undefined
  let unsubscribe: Unsubscribe | undefined
  onDestroy(() => {
    if (unsubscribe !== undefined) {
      unsubscribe()
    }
  })
  const coreService = await getCoreService()
  const result = (newClass: Ref<Class<T>>, newQuery: DocumentQuery<T>, options?: FindOptions<T>): void => {
    if (deepEqual(oldQuery, newQuery) && oldClass === newClass && deepEqual(oldOptions, options)) {
      return
    }
    if (unsubscribe !== undefined) {
      unsubscribe()
    }
    oldQuery = newQuery
    oldClass = newClass
    oldOptions = options
    const q = coreService.query(newClass, newQuery, options)
    unsubscribe = q.subscribe(action)
  }
  try {
    result(_class, _query, options)
  } catch (ex) {
    console.error(ex)
  }
  console.log('result', Promise.resolve(result));
  return Promise.resolve(result)
}

/**
 * Construct and register a live query.
 *
 * Usage:
 *
 * $: liveQuery(_class, query, action)
 * @param liveQuery - a live query identifier.
 * @param _class
 * @param _query
 * @param action
 */
export async function liveQuery<T extends Doc> (liveQuery: Promise<QueryUpdater<T>> | undefined, _class: Ref<Class<T>>, _query: DocumentQuery<T>, action: (docs: T[]) => void, options?: FindOptions<T>): Promise<QueryUpdater<T>> {
  if (liveQuery !== undefined) {
    const lq = (await liveQuery)
    lq(_class, _query, options)
    return lq
  }
  return await createLiveQuery(_class, _query, action, options)
}

export function getEmptyModel (): ClassModel {
  return {
    getGroups (): GroupModel[] {
      return []
    },
    getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined {
      return undefined
    }, // eslint-disable-line
    getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[] {
      return []
    }, // eslint-disable-line
    getAttributes (): AttrModel[] {
      return []
    },
    getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined {
      return undefined
    }, // eslint-disable-line
    filterAttributes (keys: string[]): ClassModel {
      return this
    }, // eslint-disable-line
    getPrimary (): AttrModel | undefined {
      return undefined
    },
    filterPrimary (): { model: ClassModel, primary: AttrModel | undefined } {
      return { model: this, primary: undefined }
    }
  }
}

export function getEmptyAttribute (_class: Ref<Class<Obj>>): AttrModel {
  return {
    _class,
    key: 'non-existent',
    label: 'Несуществующий аттрибут' as IntlString,
    placeholder: '' as IntlString,
    presenter: 'component:ui.StringPresenter' as AnyComponent,
    type: { _class: CORE_CLASS_TYPE },
    primary: false
  }
}
