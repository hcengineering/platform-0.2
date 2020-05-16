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
import { Plugin, PluginId, plugin, Resource } from '@anticrm/platform'
import core, { Type, Ref, Class, Obj } from '@anticrm/platform-core'

export type IntlString = Resource<string> & { __intl_string: void }

export const pluginId = 'i18n' as PluginId<I18nPlugin>

export interface I18nPlugin extends Plugin {
  translate(string: IntlString, params?: Record<string, PrimitiveType> | undefined): string | undefined
  loadStrings(translations: { [key: string]: string }): void
}

export default plugin('i18n' as PluginId<I18nPlugin>, { core: core.id }, {
  native: {
    IntlString: '' as Resource<Type<IntlString>>,
  },
})
