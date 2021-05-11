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

import { Component, Status, Severity, unknownError } from '@anticrm/status'
import type { IntlString } from '@anticrm/status'
import { Code } from './status'
import { setPlatformStatus } from './event'

import { IntlMessageFormat } from 'intl-messageformat'

export type { IntlString }

type Loader = (locale: string) => Promise<Record<string, IntlString>>

const locale = 'en'

const loaders = new Map<Component, Loader>()
const translations = new Map<Component, Record<string, IntlString> | Status>()
const cache = new Map<IntlString, IntlMessageFormat | Status>()

export function addStringsLoader (component: Component, loader: Loader): void {
  loaders.set(component, loader)
}

async function loadTranslationsForComponent (component: Component): Promise<Record<string, IntlString> | Status> {
  const loader = loaders.get(component)
  if (loader === undefined) {
    const status = new Status(Severity.ERROR, Code.NoLoaderForStrings, { component })
    setPlatformStatus(status)
    return status
  }
  try {
    return await loader(locale)
  } catch (err) {
    const status = unknownError(err)
    setPlatformStatus(status)
    return status
  }
}

async function getTranslation (message: IntlString): Promise<IntlString | Status> {
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
  return messages[id] ?? message
}

export async function translate<P extends Record<string, any>> (message: IntlString<P>, params: P): Promise<string> {
  const compiled = cache.get(message)
  if (compiled !== undefined) {
    if (compiled instanceof Status) {
      return message
    }
    return compiled.format(params)
  } else {
    const translation = await getTranslation(message)
    if (translation instanceof Status) {
      cache.set(message, translation)
      return message
    }
    const compiled = new IntlMessageFormat(translation, locale)
    cache.set(message, compiled)
    return compiled.format(params)
  }
}
