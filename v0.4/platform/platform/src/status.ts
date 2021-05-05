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

import type { Component, StatusCode, ParameterizedId } from '@anticrm/status'
import { Status, Severity } from '@anticrm/status'

export function defineCode<T extends Record<string, ParameterizedId>> (component: Component, code: T): T {
  const transformed: Record<string, string> = {}
  for (const key in code) {
    const id = code[key]
    transformed[key] = component + '.' + (id === '' ? (key as string) : (id as string))
  }
  return transformed as T
}

/**
 * Platform component Id
 * @public
 */
export const Platform = 'platform' as Component

export const Code = defineCode(Platform, {
  OK: '' as StatusCode,
  UnknownError: '' as StatusCode<{ message: string }>,
  LoadingPlugin: '' as StatusCode<{ plugin: string }>,
  NoLoaderForStrings: '' as StatusCode<{ component: Component }>
}) 

/**
 * OK Status
 * @public
 */
export const OK = new Status(Severity.OK, Code.OK, {})

/**
 * Creates unknown error status
 * @public
 */
export function unknownError (err: Error): Status<{ message: string }> {
  return new Status(Severity.ERROR, Code.UnknownError, { message: err.message })
}
