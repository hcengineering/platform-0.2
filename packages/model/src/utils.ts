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

import { mergeWith } from 'lodash'
import { identify, Plugin, PluginDescriptor, Service, Resource } from '@anticrm/platform'

type IntlString = Resource<string> & { __intl_string: true }
type PluginIds = { [key: string]: { [key: string]: any } }

export function mergeIds<A extends PluginIds, B extends PluginIds> (a: A, b: B): A & B {
  return mergeWith({}, a, b, (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}

type AnyPlugin = Plugin<Service>
type Namespace = Record<string, Record<string, any>>

interface PluginDependencies {
  [key: string]: AnyPlugin
}

export function extendIds<P extends Service, X extends PluginDependencies, D extends PluginDescriptor<P, X>, N extends Namespace> (a: D, b: N): D & N {
  return mergeWith({}, a, identify(a.id, b), (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}

// S T R I N G S

type StringIds = { [key: string]: IntlString }
type AsStrings<T> = { [P in keyof T]: string }

export function verifyTranslation<T extends StringIds> (ids: T, translations: AsStrings<T>): { [key: string]: string } {
  const result = {} as Record<string, string>
  for (const key in ids) {
    const translated = translations[key]
    if (translated) {
      const id = ids[key]
      result[id] = translated
    } else { throw new Error(`no translation for ${key}`) }
  }
  return result as AsStrings<T>
}
