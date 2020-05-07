//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { modelFromEvents } from '@anticrm/platform-core/src/__model__/utils'
import coreModel from '@anticrm/platform-core/src/__model__'
import contactCoreModel from '@anticrm/contact-core/src/__model__'
import testModel from './testModel'

const events = [
  ...coreModel.events,
  ...contactCoreModel.events,

  ...testModel
]
const model = modelFromEvents(events)

console.log(JSON.stringify(model))

export default model
