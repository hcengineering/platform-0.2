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

import { Resource, setResource } from '../resource'

import { plugin2, plugin2State } from './shared'
import { PluginDependencies } from '../index'

plugin2State.parsed = true

export default async (_deps: PluginDependencies): Promise<{ id: typeof plugin2 }> => {
  plugin2State.started = true
  setResource('resource2:plugin2.Resource' as Resource<string>, 'hello resource2:My.Resource')
  return {
    id: plugin2
  }
}
