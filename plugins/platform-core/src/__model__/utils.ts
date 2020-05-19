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
import { PluginDescriptor, Service, identify, PluginDependencies } from '@anticrm/platform'

type PluginIds = { [key: string]: { [key: string]: any } }

export function mergeIds<A extends PluginIds, B extends PluginIds> (a: A, b: B): A & B {
  return mergeWith({}, a, b, (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}

type Namespace = Record<string, Record<string, any>>

export function extendIds<P extends Service, X extends PluginDependencies, D extends PluginDescriptor<P, X>, N extends Namespace> (a: D, b: N): D & N {
  return mergeWith({}, a, identify(a.id, b), (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}
