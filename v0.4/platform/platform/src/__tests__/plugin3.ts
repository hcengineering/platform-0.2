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

import { Service } from '../plugin'

import { plugin3State, TestPlugin } from './shared'

plugin3State.parsed = true

export default async (deps: { plugin1: TestPlugin, plugin2: Service }): Promise<{ deps: typeof deps }> => {
  plugin3State.started = true
  return {
    deps
  }
}
