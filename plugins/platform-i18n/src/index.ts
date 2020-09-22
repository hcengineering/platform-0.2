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

import { Metadata, plugin, Plugin, Resource, Service } from '@anticrm/platform'
import { PrimitiveType } from 'intl-messageformat'

export type IntlString = Resource<string> & { __intl_string: true }  // eslint-disable-line

export interface I18n extends Service {
  loadStrings (translations: { [key: string]: string }): void
  translate (string: IntlString, params?: Record<string, PrimitiveType> | undefined): Promise<string>
}

export default plugin('i18n' as Plugin<I18n>, {}, {
  metadata: {
    Strings: '' as Metadata<{ [key: string]: string }>
  }
})
