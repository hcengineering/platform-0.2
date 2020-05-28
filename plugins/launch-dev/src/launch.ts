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

import { Platform, Service } from '@anticrm/platform'
import { CoreService } from '@anticrm/platform-core'

import Builder from '@anticrm/platform-core/src/__model__/builder'

import coreModel from '@anticrm/platform-core/src/__model__/model'
import uiModel from '@anticrm/platform-ui/src/__model__/model'
import contactModel from '@anticrm/contact/src/__model__/model'

console.log('Plugin `launch-dev` parsed')

export default async (platform: Platform, deps: {
  core: CoreService,
}): Promise<Service> => {
  console.log('Plugin `launch-dev` started')

  const builder = new Builder(deps.core.getDb())
  builder.load(coreModel)
  builder.load(uiModel)
  builder.load(contactModel)

  console.log(JSON.stringify(builder.dump()))

  return {}
}

