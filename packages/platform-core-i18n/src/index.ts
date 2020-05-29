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

import { PrimitiveType } from 'intl-messageformat'
import { Plugin, Service, plugin, Resource } from '@anticrm/platform'
import core, { Type, Instance, Exert } from '@anticrm/platform-core'

export type IntlString = Resource<string> & { __intl_string: void }  // eslint-disable-line

export const pluginId = 'i18n' as Plugin<I18nService>

export interface I18nService extends Service {
  translate (string: IntlString, params?: Record<string, PrimitiveType> | undefined): string | undefined
  loadStrings (translations: { [key: string]: string }): void
}

export default plugin('i18n' as Plugin<I18nService>, { core: core.id }, {
  method: {
    IntlString_exert: '' as Resource<(this: Instance<Type<any>>) => Exert>
  }
})
