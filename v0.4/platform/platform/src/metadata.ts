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

import type { Metadata } from '@anticrm/status'

export type { Metadata }

type ExtractType<T, X extends Record<string, Metadata<T>>> = {
  [P in keyof X]: X[P] extends Metadata<infer Z> ? Z : never
}

const metadata = new Map<Metadata<any>, any>()

export function getMetadata<T> (id: Metadata<T>): T | undefined {
  return metadata.get(id)
}

export function setMetadata<T> (id: Metadata<T>, value: T): void {
  metadata.set(id, value)
}

export function loadMetadata<T, X extends Record<string, Metadata<T>>> (ids: X, data: ExtractType<T, X>): void {
  for (const key in ids) {
    const id = ids[key]
    const resource = data[key]
    if (resource === undefined) {
      throw new Error(`no metadata provided, key: ${key}, id: ${String(id)}`)
    }
    metadata.set(id, resource)
  }
}
