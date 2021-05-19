//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
import { model as taskModel } from './test_tasks'
import { writeFile } from 'fs'

import { model as coreModel } from '@anticrm/core-model'
import { model as domainsModel } from '..'

const builder = new Builder()
coreModel(builder)
domainsModel(builder)
taskModel(builder)

writeFile('../domains/src/__tests__/model.json', JSON.stringify(builder.dump(), undefined, 2), (err: Error | null) => {
  if (err !== null) {
    return console.log(err)
  }
  console.log('model saved')
})
