//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Component, PlatformError, Status, Severity } from '@anticrm/status'
import { Platform, CODE_NO_LOADER_FOR_STRINGS, unknownError } from './status'

import { IntlMessageFormat } from 'intl-messageformat'

export type IntlString<T extends Record<string, any> = {}> = string & { __intl_string: T }
type Loader = (locale: string) => Promise<Record<string, IntlString>>

const locale = 'en'

const loaders = new Map<Component, Loader>()
const translations = new Map<Component, Record<string, IntlString> | Status>()
const cache = new Map<IntlString, IntlMessageFormat | Status>()

export function defineStrings<T extends Record<string, IntlString>>(component: Component, strings: T): T {
  const transformed: Record<string, string> = {}
  for (const key in strings) {
    const id = strings[key]
    transformed[key] = component + '.' + (id === '' ? key : id)
  }
  return transformed as T
}

export function addStringsLoader(component: Component, loader: Loader) {
  loaders.set(component, loader)
}

async function loadTranslationsForComponent(component: Component): Promise<Record<string, IntlString> | Status> {
  const loader = loaders.get(component)
  if (loader === undefined)
    return new Status(Severity.ERROR, Platform, CODE_NO_LOADER_FOR_STRINGS, {component})
  try {
    return await loader(locale)
  } catch(err) {
    return unknownError(err)
  }
}

async function getTranslation(message: IntlString): Promise<IntlString | Status | undefined> {
  const [comp, id] = message.split('.')
  const component = comp as Component
  let messages = translations.get(component)
  if (messages === undefined) {
    messages = await loadTranslationsForComponent(component)
    translations.set(component, messages)
  }
  if (messages instanceof Status) {
    return messages
  }
  return messages[id]
}

export async function translate<P extends Record<string, any>>(message: IntlString<P>, params: P): Promise<string> {
  let compiled = cache.get(message)
  if (compiled !== undefined) {
    if (compiled instanceof Status) {
      throw new PlatformError(compiled)
    }
    return compiled.format(params)
  } else {
    const translation = await getTranslation(message)
    if (translation instanceof Status) {
      cache.set(message, translation)
      throw new PlatformError(translation)
    }
    const compiled = new IntlMessageFormat(translation ?? message, locale)
    cache.set(message, compiled)
    return compiled.format(params)
  } 
}
