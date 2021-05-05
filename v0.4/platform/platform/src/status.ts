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
import { Status, Severity } from '@anticrm/status'

/**
 * Platform component Id
 * @public
 */
export const Platform = 'platform' as Component

export const CODE_OK = 0 as StatusCode
export const CODE_UNKNOWN_ERROR = 1 as StatusCode<{ message: string }>
export const CODE_LOADING_PLUGIN = 2 as StatusCode<{ plugin: string }>
export const CODE_NO_LOADER_FOR_STRINGS = 3 as StatusCode<{component: Component}>

/**
 * OK Status
 * @public
 */
export const OK = new Status(Severity.OK, Platform, CODE_OK, {})

/**
 * Creates unknown error status
 * @public
 */
export function unknownError (err: Error): Status<{ message: string }> {
  return new Status(Severity.ERROR, Platform, CODE_UNKNOWN_ERROR, { message: err.message })
}
