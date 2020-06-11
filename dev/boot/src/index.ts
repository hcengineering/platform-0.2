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

import Builder from '@anticrm/platform-core/src/__model__/builder'

import coreModel from '@anticrm/platform-core/src/__model__/model'
import i18nModel from '@anticrm/platform-core-i18n/src/__model__/model'
import uiModel from '@anticrm/platform-ui/src/__model__/model'
import workbenchModel from '@anticrm/platform-workbench/src/__model__/model'
import contactModel from '@anticrm/contact/src/__model__/model'

import contactRu from '@anticrm/contact/src/__model__/strings/ru'

import { MongoClient } from 'mongodb'

const builder = new Builder()
builder.load(coreModel)
builder.load(i18nModel)
builder.load(uiModel)
builder.load(workbenchModel)
builder.load(contactModel)

console.log('model:')
const model = builder.dump()
const modelJson = JSON.stringify(model)
console.log(modelJson)

console.log('strings:')
const stringsJson = JSON.stringify(contactRu)
console.log(stringsJson)

const fs = require('fs')

fs.writeFile(__dirname + "/../../prod/src/model.json", modelJson, 'utf8', function (err: Error) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.")
    return console.log(err);
  }
  console.log("model saved.")
})

fs.writeFile(__dirname + "/../../prod/src/strings.json", stringsJson, 'utf8', function (err: Error) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.")
    return console.log(err);
  }
  console.log("strings saved.")
})

function initDatabase (uri: string, tenant: string) {
  MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
    const db = client.db(tenant)
    db.collection('model', (err, coll) => {
      coll.insertMany(model).then(result => { client.close() })
    })
  })

}

initDatabase('mongodb://localhost:27017', 'company1')

