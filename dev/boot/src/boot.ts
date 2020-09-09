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

import { Builder } from '@anticrm/platform-model'

import platformModel from '@anticrm/platform-model/src/model'
import presentationModel from '@anticrm/presentation-model/src/model'
import workbenchModel from '@anticrm/workbench-model/src/model'
import contactModel from '@anticrm/contact-model/src/model'
import chunterModel from '@anticrm/chunter-model/src/model'
import recruitmentModel from '@anticrm/recruitment-model/src/model'
import taskModel from '@anticrm/task-model/src/model'

import taskStrings from '@anticrm/task-model/src/strings/ru'

export const builder = new Builder()
builder.load(platformModel)
builder.load(presentationModel)
builder.load(workbenchModel)
builder.load(contactModel)
builder.load(chunterModel)
builder.load(recruitmentModel)
builder.load(taskModel)

export const Model = builder.dumpAll()
export const Strings = {
  ...taskStrings
}
