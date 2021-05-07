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

import type { Component, StatusCode } from '@anticrm/status'
import { identify } from '@anticrm/status'

import type { Metadata } from './metadata'

/**
 * Platform component Id
 * @public
 */
export const Platform = 'platform' as Component

export const Code = identify(Platform, {
  LoadingPlugin: '' as StatusCode<{ plugin: string }>,
  NoLoaderForStrings: '' as StatusCode<{ component: Component }>
})

export const WHO_AM_I: Metadata<string> = 'platform.WhoAmI' as Metadata<string>
export const TOKEN: Metadata<string> = 'platform.Token' as Metadata<string>
