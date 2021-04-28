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

import { Builder } from '@anticrm/model'

import { model as modelModel } from '@anticrm/model/src/__model__'
import { model as presentation } from '@anticrm/presentation/src/__model__'
import { model as contact } from '@anticrm/contact/src/__model__'
import { model as workbench } from '@anticrm/workbench/src/__model__'
import { model as fsm } from '@anticrm/fsm/src/__model__'
import { model as task } from '@anticrm/task/src/__model__'
import { model as chunter } from '@anticrm/chunter/src/__model__'
import { model as datagen } from '@anticrm/data-generator/src/__model__'
import { model as recruiting } from '@anticrm/recruiting/src/__model__'
import { model as personExtras } from '@anticrm/person-extras/src/__model__'
import { model as calendar } from '@anticrm/calendar/src/__model__'

import { model as activity } from '@anticrm/activity/src/__model__'

export const builder = new Builder()
builder.load(modelModel)
builder.load(presentation)
builder.load(workbench)
builder.load(activity)
builder.load(fsm)
builder.load(contact)
builder.load(personExtras)
builder.load(chunter)
builder.load(task)
builder.load(datagen)
builder.load(recruiting)
builder.load(calendar)

export const Model = builder.dumpAll()
export const Strings = {
  // ...taskStrings
}
